package service

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/repo"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

type ChallengeRecordService struct {
	*orz.Service
	*repo.ChallengeRecordRepo
}

func NewChallengeRecordService(db *gorm.DB) *ChallengeRecordService {
	return &ChallengeRecordService{
		Service:             orz.NewService(db),
		ChallengeRecordRepo: repo.NewChallengeRecordRepo(db),
	}
}
