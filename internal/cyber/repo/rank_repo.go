package repo

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/views"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

type RankRepo struct {
	orz.Repository[models.Rank, string]
}

func NewRankRepo(db *gorm.DB) *RankRepo {
	return &RankRepo{Repository: orz.NewRepository[models.Rank, string](db)}
}

// List 列出排行榜，包含用户信息
func (r RankRepo) List(ctx context.Context, limit int) (items []views.RankView, err error) {
	err = r.GetDB(ctx).
		Model(&models.Rank{}).
		Select("ranks.score, ranks.total_time as total_time, ranks.total_time_str as total_time_str, ranks.user_id as user_id, users.name as user_name, users.avatar as user_avatar").
		Joins("left join users on users.id = ranks.user_id").
		Order("ranks.score desc, ranks.total_time asc, users.name asc").
		Limit(limit).
		Find(&items).Error
	return
}

// MaxUpdatedAt 获取排行榜的最后更新时间（updated_at 的最大值）
func (r RankRepo) MaxUpdatedAt(ctx context.Context) (int64, error) {
	var ts int64
	err := r.GetDB(ctx).
		Model(&models.Rank{}).
		Select("COALESCE(MAX(updated_at), 0)").
		Scan(&ts).Error
	return ts, err
}
