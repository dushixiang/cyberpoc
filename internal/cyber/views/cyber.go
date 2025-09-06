package views

import "github.com/dushixiang/cyberpoc/internal/cyber/models"

type SimpleView struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type ChallengeDetail struct {
	models.Challenge

	AttemptCount int64 `json:"attempt_count"` // 挑战次数
	SolvedCount  int64 `json:"solved_count"`  // 成功人数
	Solved       bool  `json:"solved"`        // 是否已解决
}

type ChallengeSimple struct {
	ID           string `json:"id"`
	Name         string `json:"name"`          // 题目名称 (e.g., "Easy SQL Injection")
	Category     string `json:"category"`      // 题目类别 (Web、Pwn、Crypto等)
	Difficulty   string `json:"difficulty"`    // 难度等级 (Easy、Medium、Hard)
	Points       int64  `json:"points"`        // 题目分值
	CreatedAt    int64  `json:"created_at"`    // 创建时间
	UpdatedAt    int64  `json:"updated_at"`    // 更新时间
	AttemptCount int64  `json:"attempt_count"` // 挑战次数
	SolvedCount  int64  `json:"solved_count"`  // 成功人数
	Solved       bool   `json:"solved"`        // 是否已解决
}

type InstanceView struct {
	Status    string `json:"status"`     // 状态
	CreatedAt int64  `json:"created_at"` // 创建时间
	ExpiresAt int64  `json:"expires_at"` // 失效时间
	AccessUrl string `json:"accessUrl"`
}

type SolveView struct {
	UserId        string `json:"user_id"`
	UserName      string `json:"user_name"`
	UserAvatar    string `json:"user_avatar"`
	ChallengeId   string `json:"challenge_id"`
	ChallengeName string `json:"challenge_name"`
	Points        int64  `json:"points"`        // 题目分值
	StartAt       int64  `json:"start_at"`      // 开始时间
	SolvedAt      int64  `json:"solved_at"`     // 通过时间
	UsedTime      int64  `json:"used_time"`     // 使用时长
	UsedTimeStr   string `json:"used_time_str"` // 使用时长
}

type RankView struct {
	Score        int64  `json:"score"`
	UserId       string `json:"userId"`
	UserName     string `json:"userName"`
	UserAvatar   string `json:"userAvatar"`
	TotalTime    int64  `json:"totalTime"`    // 总耗时（秒）
	TotalTimeStr string `json:"totalTimeStr"` // 总耗时字符串
}
