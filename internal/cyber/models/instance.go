package models

type InstanceStatus string

const (
	InstanceStatusCreating      InstanceStatus = "creating"       // 创建中
	InstanceStatusCreateFailure InstanceStatus = "create-failure" // 创建失败
	InstanceStatusRunning       InstanceStatus = "running"        // 运行中
	InstanceStatusDeleting      InstanceStatus = "deleting"       // 删除中
	InstanceStatusDeleteFailure InstanceStatus = "delete-failure" // 删除失败
)

// Instance 实例
type Instance struct {
	ID            string         `gorm:"primary_key" json:"id"`
	UserId        string         `gorm:"index" json:"user_id"`        // 用户ID
	UserName      string         `json:"user_name"`                   // 用户名
	ChallengeId   string         `gorm:"index" json:"challenge_id"`   // 题目ID
	ChallengeName string         `json:"challenge_name"`              // 挑战名称
	Flag          string         `json:"flag"`                        // Flag
	Exposed       string         `json:"exposed"`                     // 暴露端口
	Duration      int            `json:"duration"`                    // 持续时长 单位：分钟
	CpuLimit      float64        `json:"cpu_limit"`                   // CPU限制
	MemoryLimit   int64          `json:"memory_limit"`                // 内存限制(MB)
	Status        InstanceStatus `gorm:"index;size:20" json:"status"` // 状态
	Subdomain     string         `json:"subdomain"`                   // 子域名
	AccessUrl     string         `json:"access_url"`                  // 访问地址
	Message       string         `json:"message"`                     // 消息
	CreatedAt     int64          `json:"created_at"`                  // 创建时间
	ExpiresAt     int64          `json:"expires_at"`                  // 失效时间
}

func (m Instance) TableName() string {
	return "instances"
}
