package internal

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/dushixiang/cyberpoc/internal/cyber"
	"github.com/dushixiang/cyberpoc/internal/identity"
	"github.com/dushixiang/cyberpoc/internal/types"
	"github.com/dushixiang/cyberpoc/pkg/nostd"
	"github.com/dushixiang/cyberpoc/web"
	"github.com/go-orz/orz"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"go.uber.org/zap"
)

func Run(configPath string) error {
	app := NewCyberApp()

	framework, err := orz.NewFramework(
		orz.WithConfig(configPath),
		orz.WithLoggerFromConfig(),
		orz.WithDatabase(),
		orz.WithHTTP(),
		orz.WithApplication(app),
	)
	if err != nil {
		return err
	}

	return framework.Run()
}

func NewCyberApp() orz.Application {
	return &CyberApp{
		apps: []types.SubApp{
			identity.Instance(),
			cyber.Instance(),
		},
	}
}

var _ orz.Application = (*CyberApp)(nil)

type CyberApp struct {
	conf *config.Config

	apps []types.SubApp
}

func (r *CyberApp) Configure(app *orz.App) error {
	logger := app.Logger()

	e := app.GetEcho()

	var conf config.Config
	err := app.GetConfig().App.Unmarshal(&conf)
	if err != nil {
		return fmt.Errorf("failed to unmarshal config: %v", err)
	}

	if err := r.Init(app, &conf); err != nil {
		logger.Fatal("app init failed", zap.Error(err))
	}

	e.HidePort = true
	e.HideBanner = true

	e.Use(middleware.Gzip())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		Skipper:      middleware.DefaultSkipper,
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))
	e.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
		LogErrorFunc: func(c echo.Context, err error, stack []byte) error {
			sugar := logger.Sugar()
			sugar.Error(fmt.Sprintf("[PANIC RECOVER] %v %s\n", err, stack))
			return err
		},
	}))
	e.Use(WithErrorHandler(logger))
	customValidator := nostd.CustomValidator{Validator: validator.New()}
	if err := customValidator.TransInit(); err != nil {
		logger.Sugar().Fatal("failed to init custom validator", zap.Error(err))
	}
	e.Validator = &customValidator

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Skipper: func(c echo.Context) bool {
			path := c.Request().RequestURI
			if strings.HasPrefix(path, "/api") {
				return true
			}
			return false
		},
		Root:       "",
		Index:      "index.html",
		HTML5:      true,
		Browse:     false,
		IgnoreBase: false,
		Filesystem: http.FS(web.Assets()),
	}))

	return nil
}

func (r *CyberApp) Init(app *orz.App, conf *config.Config) error {
	// register apps
	for _, a := range r.apps {
		err := a.Configure(app, conf)
		if err != nil {
			return err
		}
	}
	logger := app.Logger()
	// 获取并打印所有已注册的路由
	e := app.GetEcho()
	for _, route := range e.Routes() {
		if route.Method == "echo_route_not_found" {
			continue
		}
		logger.Info("Registered route", zap.String("method", route.Method), zap.String("path", route.Path))
	}
	return nil
}
