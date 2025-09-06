package repo

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{
		Repository: orz.NewRepository[models.User, string](db),
	}
}

type UserRepo struct {
	orz.Repository[models.User, string]
}

func (r UserRepo) FindByAccount(ctx context.Context, account string) (m models.User, err error) {
	db := r.GetDB(ctx)
	err = db.Table(r.GetTableName()).Where("account = ?", account).First(&m).Error
	return m, err
}

func (r UserRepo) ExistsByAccount(ctx context.Context, account string) (bool, error) {
	var count int64 = 0
	err := r.GetDB(ctx).Table(r.GetTableName()).Where("account = ?", account).Count(&count).Error
	return count > 0, err
}

func (r UserRepo) UpdateEnabledByIdIn(ctx context.Context, enabled bool, ids []string) (err error) {
	db := r.GetDB(ctx)
	err = db.Table(r.GetTableName()).Where("id in ?", ids).Update("enabled", enabled).Error
	return err
}
