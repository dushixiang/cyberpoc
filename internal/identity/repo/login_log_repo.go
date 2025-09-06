package repo

import (
	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewLoginLogRepo(db *gorm.DB) *LoginLogRepo {
	return &LoginLogRepo{
		Repository: orz.NewRepository[models.LoginLog, string](db),
	}
}

type LoginLogRepo struct {
	orz.Repository[models.LoginLog, string]
}
