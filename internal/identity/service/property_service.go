package service

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/dushixiang/cyberpoc/internal/identity/repo"
	"github.com/go-orz/orz"
	"github.com/spf13/cast"
	"gorm.io/gorm"
)

func NewPropertyService(db *gorm.DB) *PropertyService {
	return &PropertyService{
		Service:      orz.NewService(db),
		PropertyRepo: repo.NewPropertyRepo(db),
	}
}

type PropertyService struct {
	*orz.Service
	*repo.PropertyRepo
}

var defaultProperties = map[string]string{
	models.PropertyKeyMaxChallengeCount: "100",
}

func (r PropertyService) Init(ctx context.Context) error {
	return r.Transaction(ctx, func(ctx context.Context) error {
		properties, err := r.Get(ctx)
		if err != nil {
			return err
		}
		var insertProperties []models.Property
		for k, v := range defaultProperties {
			if _, ok := properties[k]; !ok {
				insertProperties = append(insertProperties, models.Property{
					ID:    k,
					Value: v,
				})
			}
		}

		if len(insertProperties) > 0 {
			if err := r.CreateInBatches(ctx, insertProperties, 100); err != nil {
				return err
			}
		}
		return nil
	})
}

func (r PropertyService) Get(ctx context.Context) (map[string]string, error) {
	items, err := r.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	var properties = make(map[string]string)
	for _, item := range items {
		properties[item.ID] = item.Value
	}
	return properties, nil
}

func (r PropertyService) Set(ctx context.Context, data map[string]interface{}) error {
	return r.Transaction(ctx, func(ctx context.Context) error {
		for k, v := range data {
			var property = models.Property{
				ID:    k,
				Value: cast.ToString(v),
			}
			if err := r.PropertyRepo.Save(ctx, &property); err != nil {
				return err
			}
		}
		return nil
	})
}

func (r PropertyService) GetSystemConfig(ctx context.Context) (*models.SystemConfig, error) {
	data, err := r.Get(ctx)
	if err != nil {
		return nil, err
	}
	return &models.SystemConfig{
		MaxChallengeCount: cast.ToInt(data[models.PropertyKeyMaxChallengeCount]),
		Name:              data[models.PropertyKeySystemName],
	}, nil
}
