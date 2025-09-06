package models

// Rank 排行榜（按用户聚合）
type Rank struct {
	ID           string `gorm:"primary_key;size:36" json:"id"`
	UserId       string `gorm:"index" json:"user_id"` // 用户ID
	Score        int64  `json:"score"`                // 总积分
	TotalTime    int64  `json:"total_time"`           // 总耗时（秒）
	TotalTimeStr string `json:"total_time_str"`       // 总耗时字符串
	UpdatedAt    int64  `json:"updated_at" gorm:"autoUpdateTime:milli"`
}

func (m Rank) TableName() string {
	return "ranks"
}
