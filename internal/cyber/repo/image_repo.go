package repo

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewImageRepo(db *gorm.DB) *ImageRepo {
	return &ImageRepo{
		Repository: orz.NewRepository[models.Image, string](db),
	}
}

type ImageRepo struct {
	orz.Repository[models.Image, string]
}
