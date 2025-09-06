package repo

import (
	"context"
	"fmt"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/views"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewSolveRepo(db *gorm.DB) *SolveRepo {
	return &SolveRepo{
		Repository: orz.NewRepository[models.Solve, string](db),
	}
}

type SolveRepo struct {
	orz.Repository[models.Solve, string]
}

func (r SolveRepo) FindByChallengeIdWithLimit(ctx context.Context, challengeId string, limit int) (items []views.SolveView, err error) {
	err = r.GetDB(ctx).
		Model(&models.Solve{}).
		Select("solves.*, users.name as user_name, users.avatar as user_avatar").
		Joins("left join users on users.id = solves.user_id").
		Where("solves.challenge_id = ?", challengeId).
		Order("solves.used_time asc").
		Limit(limit).
		Find(&items).Error
	return
}

func (r SolveRepo) FindFirstByChallengeId(ctx context.Context, challengeId string) (items []views.SolveView, err error) {
	err = r.GetDB(ctx).
		Model(&models.Solve{}).
		Select("solves.*, users.name as user_name, users.avatar as user_avatar").
		Joins("left join users on users.id = solves.user_id").
		Where("solves.challenge_id = ?", challengeId).
		Order("solves.solved_at asc").
		Limit(1).
		Find(&items).Error
	return
}

func (r SolveRepo) FindByChallengeIdAndUserId(ctx context.Context, challengeId, userId string) (items []models.Solve, err error) {
	err = r.GetDB(ctx).Where("challenge_id = ? and user_id = ?", challengeId, userId).Find(&items).Error
	return
}

// PagingWithUserAndChallenge 分页查询通关记录，包含用户和题目信息
func (r SolveRepo) PagingWithUserAndChallenge(ctx context.Context, offset, limit int, sortField, sortOrder string) (items []views.SolveView, total int64, err error) {
	db := r.GetDB(ctx)

	// 先查询总数
	err = db.Model(&models.Solve{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// 查询分页数据
	orderBy := fmt.Sprintf("solves.%s %s", sortField, sortOrder)
	err = db.
		Model(&models.Solve{}).
		Select("solves.id, solves.user_id, solves.challenge_id, solves.start_at, solves.solved_at, solves.used_time, solves.used_time_str, users.name as user_name, users.avatar as user_avatar, challenges.name as challenge_name, challenges.points as points").
		Joins("left join users on users.id = solves.user_id").
		Joins("left join challenges on challenges.id = solves.challenge_id").
		Order(orderBy).
		Offset(offset).
		Limit(limit).
		Find(&items).Error

	return items, total, err
}

func (r SolveRepo) CountByChallengeIdAndUserId(ctx context.Context, challengeId, userId string) (int64, error) {
	var count int64
	err := r.GetDB(ctx).WithContext(ctx).
		Model(&models.Solve{}).
		Where("challenge_id = ? and user_id = ?", challengeId, userId).
		Count(&count).Error
	return count, err
}

func (r SolveRepo) CountByChallengeId(ctx context.Context, challengeId string) (int64, error) {
	var count int64
	err := r.GetDB(ctx).WithContext(ctx).
		Model(&models.Solve{}).
		Where("challenge_id = ?", challengeId).
		Count(&count).Error
	return count, err
}

func (r SolveRepo) GroupCountByChallengeIdIn(ctx context.Context, challengeIds []string) (data map[string]int64, err error) {
	var items []CountChallengeId
	err = r.GetDB(ctx).
		Model(&models.Solve{}).
		Select("count(id) as count, challenge_id").
		Where("challenge_id in ?", challengeIds).
		Group("challenge_id").
		Find(&items).Error

	if err != nil {
		return nil, err
	}
	data = make(map[string]int64)
	for _, item := range items {
		data[item.ChallengeId] = item.Count
	}
	return data, err
}

func (r SolveRepo) GroupCountByChallengeIdInAndUserId(ctx context.Context, challengeIds []string, userId string) (data map[string]int64, err error) {
	var items []CountChallengeId
	err = r.GetDB(ctx).
		Model(&models.Solve{}).
		Select("count(id) as count, challenge_id").
		Where("challenge_id in ? and user_id = ?", challengeIds, userId).
		Group("challenge_id").
		Find(&items).Error

	if err != nil {
		return nil, err
	}
	data = make(map[string]int64)
	for _, item := range items {
		data[item.ChallengeId] = item.Count
	}
	return data, err
}
