package handler

import (
	"context"
	"strconv"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

func NewSolveHandler(solveService *service.SolveService, rankService *service.RankService, challengeService *service.ChallengeService) *SolveHandler {
	return &SolveHandler{
		solveService:     solveService,
		rankService:      rankService,
		challengeService: challengeService,
	}
}

type SolveHandler struct {
	solveService     *service.SolveService
	rankService      *service.RankService
	challengeService *service.ChallengeService
}

// Paging 通关记录分页查询
func (h SolveHandler) Paging(c echo.Context) error {
	ctx := c.Request().Context()

	// 获取分页参数
	pageIndex := 1
	pageSize := 20
	if pi := c.QueryParam("pageIndex"); pi != "" {
		if p, err := strconv.Atoi(pi); err == nil && p > 0 {
			pageIndex = p
		}
	}
	if ps := c.QueryParam("pageSize"); ps != "" {
		if p, err := strconv.Atoi(ps); err == nil && p > 0 {
			pageSize = p
		}
	}

	// 获取排序参数
	sortField := c.QueryParam("sort_field")
	sortOrder := c.QueryParam("sort_order")
	if sortField == "" {
		sortField = "solved_at"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}

	// 计算偏移量
	offset := (pageIndex - 1) * pageSize

	// 查询数据
	items, total, err := h.solveService.SolveRepo.PagingWithUserAndChallenge(ctx, offset, pageSize, sortField, sortOrder)
	if err != nil {
		return err
	}

	return orz.Ok(c, orz.Map{
		"items": items,
		"total": total,
	})
}

// RecomputeRanks 立即重新计算排行榜
func (h SolveHandler) RecomputeRanks(c echo.Context) error {
	ctx := c.Request().Context()
	err := h.rankService.Recompute(ctx)
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{"ok": true})
}

// FixSolveRecords 修复通关记录 - 删除题目表中不存在的通关记录
func (h SolveHandler) FixSolveRecords(c echo.Context) error {
	ctx := c.Request().Context()
	deletedCount, err := h.cleanInvalidSolves(ctx)
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{
		"ok":      true,
		"deleted": deletedCount,
	})
}

// cleanInvalidSolves 清理无效的通关记录
func (h SolveHandler) cleanInvalidSolves(ctx context.Context) (int64, error) {
	db := h.solveService.GetDB(ctx)

	// 查找所有不存在对应题目的通关记录
	var solve models.Solve
	result := db.WithContext(ctx).
		Model(&solve).
		Where("challenge_id NOT IN (SELECT id FROM challenges)").
		Delete(&solve)

	if result.Error != nil {
		return 0, result.Error
	}

	return result.RowsAffected, nil
}
