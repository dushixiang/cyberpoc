package repo

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

type ChallengeRecordRepo struct {
	orz.Repository[models.ChallengeRecord, string]
}

func NewChallengeRecordRepo(db *gorm.DB) *ChallengeRecordRepo {
	return &ChallengeRecordRepo{
		Repository: orz.NewRepository[models.ChallengeRecord, string](db),
	}
}

func (r *ChallengeRecordRepo) CountByChallengeId(ctx context.Context, challengeId string) (int64, error) {
	var count int64
	err := r.GetDB(ctx).WithContext(ctx).
		Model(&models.ChallengeRecord{}).
		Where("challenge_id = ?", challengeId).
		Count(&count).Error
	return count, err
}

type CountChallengeId struct {
	Count       int64  `json:"count"`
	ChallengeId string `json:"challenge_id"`
}

func (r *ChallengeRecordRepo) GroupCountByChallengeIdIn(ctx context.Context, challengeIds []string) (data map[string]int64, err error) {
	var items []CountChallengeId
	err = r.GetDB(ctx).
		Model(&models.ChallengeRecord{}).
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
