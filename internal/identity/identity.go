package identity

import (
	"context"
	"sync"

	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/dushixiang/cyberpoc/internal/identity/handler"
	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/dushixiang/cyberpoc/internal/identity/service"
	"github.com/dushixiang/cyberpoc/internal/types"
	"github.com/go-orz/orz"
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
	AccountHandler  *handler.AccountHandler
	PropertyHandler *handler.PropertyHandler
	UserHandler     *handler.UserHandler
	LoginLogHandler *handler.LoginLogHandler

	AccountService  *service.AccountService
	PropertyService *service.PropertyService
	UserService     *service.UserService
	LoginLogService *service.LoginLogService
}

type App struct {
	dependency *Dependency
}

func (a *App) Configure(app *orz.App, conf *config.Config) error {
	logger := app.Logger()
	database := app.GetDatabase()
	e := app.GetEcho()
	a.dependency = ProviderDependency(logger, database, conf)
	// 配置依赖
	a.dependency.UserService.SessionTerminator = a.dependency.AccountService

	// 迁移数据库
	err := database.AutoMigrate(
		&models.User{},
		&models.Property{},
		&models.LoginLog{},
		&models.AccessToken{},
	)
	if err != nil {
		logger.Fatal("database auto migrate failed", zap.Error(err))
	}

	a.Init(logger)
	// 注册路由
	anonymousApi := e.Group("/api")
	{
		accountHandler := a.dependency.AccountHandler
		anonymousApi.GET("/captcha", accountHandler.Captcha)
		anonymousApi.POST("/login", accountHandler.Login)
		anonymousApi.POST("/register", accountHandler.Register)
		anonymousApi.POST("/send-code", accountHandler.SendCode)
		anonymousApi.POST("/forgot", accountHandler.ForgotPassword)
		anonymousApi.POST("/reset", accountHandler.ResetPassword)
	}

	api := e.Group("/api", a.Auth)
	{
		account := api.Group("/account")
		{
			accountHandler := a.dependency.AccountHandler
			account.GET("/info", accountHandler.Info)
			account.POST("/logout", accountHandler.Logout)
			account.POST("/change-password", accountHandler.ChangePassword)
			account.POST("/change-profile", accountHandler.ChangeProfile)
		}

		admin := api.Group("/admin", a.Admin)
		{
			user := admin.Group("/user")
			{
				userHandler := a.dependency.UserHandler
				user.GET("/paging", userHandler.Paging)
				user.POST("", userHandler.Create)
				user.PUT("/:id", userHandler.Update)
				user.GET("/:id", userHandler.Get)
				user.DELETE("/:id", userHandler.Delete)
				user.POST("/:id/change-password", userHandler.ChangePassword)
				user.POST("/enabled", userHandler.Enabled)
				user.POST("/disabled", userHandler.Disabled)
			}

			property := admin.Group("/property")
			{
				h := a.dependency.PropertyHandler
				property.PUT("", h.Set)
				property.GET("", h.Get)
			}
			loginLog := admin.Group("/login-log")
			{
				loginLogHandler := a.dependency.LoginLogHandler
				loginLog.GET("/paging", loginLogHandler.Paging)
				loginLog.DELETE("/all", loginLogHandler.DeleteAll)
			}
		}
	}
	return nil
}

func (a *App) Init(logger *zap.Logger) {
	ctx := context.Background()
	err := a.dependency.AccountService.Init(ctx)
	if err != nil {
		logger.Fatal("init account service failed", zap.Error(err))
	}
}
