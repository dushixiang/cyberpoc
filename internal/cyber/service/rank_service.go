package service

import (
	"context"
	"time"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/repo"
	"github.com/dushixiang/cyberpoc/internal/cyber/views"
	"github.com/go-orz/orz"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RankService struct {
	*orz.Service
	*repo.RankRepo
	*repo.SolveRepo
}

func NewRankService(db *gorm.DB) *RankService {
	return &RankService{
		Service:   orz.NewService(db),
		RankRepo:  repo.NewRankRepo(db),
		SolveRepo: repo.NewSolveRepo(db),
	}
}

// Recompute 每次全量重算积分：按用户汇总 Solve 的 points 之和为 score，仅保留前100
func (s RankService) Recompute(ctx context.Context) error {
	// 直接用聚合并排序，选前100
	db := s.RankRepo.GetDB(ctx)
	type agg struct {
		UserId       string
		Score        int64
		TotalTime    int64
		TotalTimeStr string
	}
	var aggs []agg
	err := db.WithContext(ctx).
		Table("solves").
		Select("user_id as user_id, sum(points) as score, sum(used_time) as total_time").
		Group("user_id").
		Order("score desc, total_time asc").
		Limit(100).
		Find(&aggs).Error
	if err != nil {
		return err
	}

	// 清空 ranks 后批量写入前100
	if err := db.Exec("truncate table ranks").Error; err != nil {
		_ = db.Exec("delete from ranks").Error
	}

	now := time.Now().UnixMilli()
	batch := make([]models.Rank, 0, len(aggs))
	for _, a := range aggs {
		// 将毫秒转换为秒
		totalTimeSeconds := a.TotalTime / 1000
		// 将秒转换为时间字符串
		totalTimeStr := (time.Duration(totalTimeSeconds) * time.Second).String()

		batch = append(batch, models.Rank{
			ID:           uuid.NewString(),
			UserId:       a.UserId,
			Score:        a.Score,
			TotalTime:    totalTimeSeconds,
			TotalTimeStr: totalTimeStr,
			UpdatedAt:    now,
		})
	}
	if len(batch) > 0 {
		if err := db.Create(&batch).Error; err != nil {
			return err
		}
	}
	return nil
}

func (s RankService) List(ctx context.Context, limit int) (items []views.RankView, err error) {
	return s.RankRepo.List(ctx, limit)
}

func (s RankService) LastUpdatedAt(ctx context.Context) (int64, error) {
	return s.RankRepo.MaxUpdatedAt(ctx)
}
