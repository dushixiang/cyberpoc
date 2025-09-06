package models

// ChallengeRecord 挑战记录 - 记录用户参与挑战的详细过程
type ChallengeRecord struct {
	ID            string `gorm:"primary_key;size:36" json:"id"`
	UserId        string `gorm:"index" json:"user_id"`                   // 用户ID
	UserName      string `json:"user_name"`                              // 用户名称
	ChallengeId   string `gorm:"index" json:"challenge_id"`              // 题目ID
	ChallengeName string `json:"challenge_name"`                         // 题目名称
	InstanceId    string `gorm:"index" json:"instance_id"`               // 实例ID
	CreatedAt     int64  `json:"created_at" gorm:"autoCreateTime:milli"` // 创建时间
}

func (m ChallengeRecord) TableName() string {
	return "challenge_records"
}
