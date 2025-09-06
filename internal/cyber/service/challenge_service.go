package service

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/cyber/repo"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

type ChallengeService struct {
	*orz.Service
	*repo.ChallengeRepo
}

func NewChallengeService(db *gorm.DB) *ChallengeService {
	return &ChallengeService{
		Service:       orz.NewService(db),
		ChallengeRepo: repo.NewChallengeRepo(db),
	}
}

// ExistsById 检查题目是否存在
func (s *ChallengeService) ExistsById(ctx context.Context, id string) (bool, error) {
	_, exists, err := s.ChallengeRepo.FindByIdExists(ctx, id)
	return exists, err
}
