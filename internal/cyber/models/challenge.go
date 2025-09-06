package models

// Challenge 题目
type Challenge struct {
	ID          string `gorm:"primary_key" json:"id"`
	Name        string `json:"name"`         // 题目名称 (e.g., "Easy SQL Injection")
	Description string `json:"description"`  // 题目描述，包括背景、提示等
	Category    string `json:"category"`     // 题目类别
	Difficulty  string `json:"difficulty"`   // 难度等级 (easy、medium、hard)
	Points      int64  `json:"points"`       // 题目分值
	Flag        string `json:"flag"`         // 题目的静态Flag (用于无需启动容器的题目)
	DynamicFlag bool   `json:"dynamic_flag"` // 是否动态Flag
	Enabled     bool   `json:"enabled"`      // 是否启用
	ImageId     string `json:"image_id"`     // 镜像ID
	Duration    int    `json:"duration"`     // 持续时长 单位：分钟
	Html        string `json:"html"`         // HTML内容

	Sort int64 `json:"sort" gorm:"index"` // 排序，值越大越靠前

	CreatedAt int64 `json:"created_at" gorm:"autoCreateTime:milli"` // 创建时间
	UpdatedAt int64 `json:"updated_at" gorm:"autoUpdateTime:milli"` // 更新时间
}

func (m Challenge) TableName() string {
	return "challenges"
}
