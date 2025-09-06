package repo

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewChallengeRepo(db *gorm.DB) *ChallengeRepo {
	return &ChallengeRepo{
		Repository: orz.NewRepository[models.Challenge, string](db),
	}
}

type ChallengeRepo struct {
	orz.Repository[models.Challenge, string]
}
