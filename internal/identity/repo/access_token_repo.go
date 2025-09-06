package repo

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewSessionRepo(db *gorm.DB) *AccessTokenRepo {
	return &AccessTokenRepo{
		Repository: orz.NewRepository[models.AccessToken, string](db),
	}
}

type AccessTokenRepo struct {
	orz.Repository[models.AccessToken, string]
}

func (r AccessTokenRepo) FindByUserId(ctx context.Context, userId string) (items []models.AccessToken, err error) {
	err = r.GetDB(ctx).Where("user_id = ?", userId).Find(&items).Error
	return
}
