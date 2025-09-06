package service

import (
	"context"
	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/dushixiang/cyberpoc/internal/identity/repo"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

type LoginLogService struct {
	*orz.Service
	*repo.LoginLogRepo
}

func NewLoginLogService(db *gorm.DB) *LoginLogService {
	return &LoginLogService{
		Service:      orz.NewService(db),
		LoginLogRepo: repo.NewLoginLogRepo(db),
	}
}

func (s *LoginLogService) DeleteAll(ctx context.Context) error {
	db := s.GetDB(ctx)
	return db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.LoginLog{}).Error
}