package service

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/repo"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

type SolveService struct {
	*orz.Service
	*repo.SolveRepo
}

func NewSolveService(db *gorm.DB) *SolveService {
	return &SolveService{
		Service:   orz.NewService(db),
		SolveRepo: repo.NewSolveRepo(db),
	}
}
