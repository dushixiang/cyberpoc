package cyber

import (
	"context"
	"sync"

	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/dushixiang/cyberpoc/internal/cyber/handler"
	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
	"github.com/dushixiang/cyberpoc/internal/identity"
	"github.com/dushixiang/cyberpoc/internal/types"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

var _ types.SubApp = (*App)(nil)

var (
	instance *App
	once     sync.Once
)

func Instance() *App {
	once.Do(func() {
		instance = &App{}
	})
	return instance
}

type Dependency struct {
	ChallengeHandler *handler.ChallengeHandler
	ImageHandler     *handler.ImageHandler
	IndexHandler     *handler.IndexHandler
	InstanceHandler  *handler.InstanceHandler
	DashboardHandler *handler.DashboardHandler
	SolveHandler     *handler.SolveHandler

	ChallengeService       *service.ChallengeService
	ChallengeRecordService *service.ChallengeRecordService
	ImageService           *service.ImageService
	InstanceService        *service.InstanceService
	SolveService           *service.SolveService
	RankService            *service.RankService
	ReverseProxyService    *service.ReverseProxyService
}

type App struct {
	Dependency *Dependency
}

func (a App) Configure(app *orz.App, conf *config.Config) error {
	logger := app.Logger()
	database := app.GetDatabase()
	e := app.GetEcho()
	a.Dependency = ProviderDependency(logger, database, conf)

	// 迁移数据库
	err := database.AutoMigrate(
		&models.Challenge{},
		&models.ChallengeRecord{},
		&models.Image{},
		&models.Instance{},
		&models.Solve{},
		&models.Rank{},
	)
	if err != nil {
		logger.Fatal("database auto migrate failed", zap.Error(err))
	}

	ctx := context.Background()
	err = a.Dependency.InstanceService.ReStartContainers(ctx)
	if err != nil {
		logger.Fatal("restart containers failed", zap.Error(err))
	}

	// 定时任务：每10分钟（分钟为 0,10,20,30,40,50）重算排行榜
	_ = a.Dependency.RankService.Recompute(ctx) // 启动时先跑一次
	c := cron.New()
	_, _ = c.AddFunc("*/10 * * * *", func() {
		_ = a.Dependency.RankService.Recompute(ctx)
	})
	c.Start()

	// 启动反向代理服务

	if conf.Gateway.Enabled {
		go func() {
			reverseProxy := echo.New()
			reverseProxy.HideBanner = true
			reverseProxy.Any("/*", echo.WrapHandler(a.Dependency.ReverseProxyService))

			logger.Info("proxy server listening at", zap.String("addr", conf.Gateway.Addr))
			err := reverseProxy.Start(conf.Gateway.Addr)
			if err != nil {
				logger.Fatal("reverse proxy server", zap.Error(err))
			}
		}()
	}

	// 注册路由
	{
		challenges := e.Group("/api/challenges")
		{
			indexHandler := a.Dependency.IndexHandler
			challenges.GET("/paging", indexHandler.ChallengePaging)
			challenges.GET("/:challenge_id", indexHandler.GetChallenge)
			challenges.GET("/:challenge_id/rank", indexHandler.GetChallengeRank)
			challenges.GET("/:challenge_id/instance", indexHandler.GetInstance)
			challenges.POST("/:challenge_id/run", indexHandler.ChallengeRun, identity.Auth())
			challenges.POST("/:challenge_id/destroy", indexHandler.DestroyInstance, identity.Auth())
			challenges.POST("/:challenge_id/flag", indexHandler.SubmitFlag, identity.Auth())
		}
	}

	// 公共排行接口
	e.GET("/api/ranks", a.Dependency.IndexHandler.GetRanks)
	// 管理看板接口
	e.GET("/api/admin/dashboard/stats", a.Dependency.DashboardHandler.Stats, identity.Admin())

	admin := e.Group("/api/admin", identity.Admin())
	{
		challenge := admin.Group("/challenge-records")
		{
			challengeHandler := a.Dependency.ChallengeHandler
			challenge.GET("/paging", challengeHandler.ChallengeRecordPaging)
		}

		solves := admin.Group("/solves")
		{
			solveHandler := a.Dependency.SolveHandler
			solves.GET("/paging", solveHandler.Paging)
			solves.POST("/recompute-ranks", solveHandler.RecomputeRanks)
			solves.POST("/fix-records", solveHandler.FixSolveRecords)
		}

		image := admin.Group("/images")
		{
			imageHandler := a.Dependency.ImageHandler
			image.GET("", imageHandler.List)
			image.GET("/paging", imageHandler.Paging)
			image.POST("", imageHandler.Create)
			image.POST("/sync-all", imageHandler.SyncAll)
			image.POST("/pull-all", imageHandler.PullAll)
			image.POST("/:id/sync", imageHandler.Sync)
			image.POST("/:id/pull", imageHandler.Pull)
			image.PUT("/:id", imageHandler.Update)
			image.DELETE("/:id", imageHandler.Delete)
			image.GET("/:id", imageHandler.Get)
		}

		instances := admin.Group("/instances")
		{
			instanceHandler := a.Dependency.InstanceHandler
			instances.GET("/paging", instanceHandler.Paging)
			instances.POST("/:id/destroy", instanceHandler.Destroy)
		}

		challenges := admin.Group("/challenges")
		{
			challengeHandler := a.Dependency.ChallengeHandler
			challenges.GET("/paging", challengeHandler.Paging)
			challenges.POST("", challengeHandler.Create)
			challenges.PUT("/:id", challengeHandler.Update)
			challenges.DELETE("/:id", challengeHandler.Delete)
			challenges.GET("/:id", challengeHandler.Get)
			challenges.POST("/sort", challengeHandler.Sort)
		}
	}

	return nil
}
