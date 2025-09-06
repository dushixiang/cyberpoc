//go:build wireinject
// +build wireinject

package cyber

import (
	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/dushixiang/cyberpoc/internal/cyber/handler"
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
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
	handler.NewChallengeHandler,
	handler.NewImageHandler,
	handler.NewIndexHandler,
	handler.NewInstanceHandler,
	handler.NewDashboardHandler,
	handler.NewSolveHandler,
)

var serviceSet = wire.NewSet(
	service.NewChallengeRecordService,
	service.NewChallengeService,
	service.NewImageService,
	service.NewInstanceService,
	service.NewSolveService,
	service.NewRankService,
	service.NewReverseProxyService,
)
