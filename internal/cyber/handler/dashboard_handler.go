package handler

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

type DashboardHandler struct {
	challengeService *service.ChallengeService
	instanceService  *service.InstanceService
	solveService     *service.SolveService
}

func NewDashboardHandler(challengeService *service.ChallengeService, instanceService *service.InstanceService, solveService *service.SolveService) *DashboardHandler {
	return &DashboardHandler{challengeService: challengeService, instanceService: instanceService, solveService: solveService}
}

func (h DashboardHandler) Stats(c echo.Context) error {
	ctx := c.Request().Context()
	// 基础统计：题目总数、实例总数、运行中实例、通关总数
	challengeCount, _ := h.challengeService.Repository.Count(ctx)
	instanceCount, _ := h.instanceService.InstanceRepo.Count(ctx)
	var running int64
	_ = h.instanceService.InstanceRepo.GetDB(ctx).Model(&models.Instance{}).Where("status = ?", models.InstanceStatusRunning).Count(&running).Error
	solveCount, _ := h.solveService.Repository.Count(ctx)
	return orz.Ok(c, orz.Map{
		"challenges":        challengeCount,
		"instances":         instanceCount,
		"running_instances": running,
		"solves":            solveCount,
	})
}
