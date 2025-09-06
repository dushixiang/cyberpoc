package repo

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewInstanceRepo(db *gorm.DB) *InstanceRepo {
	return &InstanceRepo{
		Repository: orz.NewRepository[models.Instance, string](db),
	}
}

type InstanceRepo struct {
	orz.Repository[models.Instance, string]
}

func (r InstanceRepo) FindByUserIdAndChallengeId(ctx context.Context, userId, challengeId string) (items []models.Instance, err error) {
	err = r.GetDB(ctx).Where("user_id = ? and challenge_id = ?", userId, challengeId).Find(&items).Error
	return
}
