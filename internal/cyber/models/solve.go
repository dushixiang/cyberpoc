package models

// Solve 通关记录
type Solve struct {
	ID          string `json:"id"`
	UserId      string `gorm:"index" json:"user_id"`      // 用户ID
	ChallengeId string `gorm:"index" json:"challenge_id"` // 题目ID
	Points      int64  `json:"points"`                    // 题目分值
	StartAt     int64  `json:"start_at"`                  // 开始时间
	SolvedAt    int64  `json:"solved_at"`                 // 通过时间
	UsedTime    int64  `json:"used_time"`                 // 使用时长
	UsedTimeStr string `json:"used_time_str"`             // 使用时长
}

func (m Solve) TableName() string {
	return "solves"
}
