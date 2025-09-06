//go:build wireinject
// +build wireinject

package identity

import (
	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/dushixiang/cyberpoc/internal/identity/handler"
	"github.com/dushixiang/cyberpoc/internal/identity/service"
	"github.com/google/wire"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func ProviderDependency(logger *zap.Logger, db *gorm.DB, conf *config.Config) *Dependency {
	panic(wire.Build(appSet))
}

var appSet = wire.NewSet(
	serviceSet,
	apiSet,
	wire.Struct(new(Dependency), "*"),
)

var apiSet = wire.NewSet(
	handler.NewUserHandler,
	handler.NewAccountHandler,
	handler.NewPropertyHandler,
	handler.NewLoginLogHandler,
)

var serviceSet = wire.NewSet(
	service.NewUserService,
	service.NewAccountService,
	service.NewPropertyService,
	service.NewMailService,
	service.NewLoginLogService,
)
