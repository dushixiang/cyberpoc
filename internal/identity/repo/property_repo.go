package repo

import (
	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

func NewPropertyRepo(db *gorm.DB) *PropertyRepo {
	return &PropertyRepo{
		Repository: orz.NewRepository[models.Property, string](db),
	}
}

type PropertyRepo struct {
	orz.Repository[models.Property, string]
}
