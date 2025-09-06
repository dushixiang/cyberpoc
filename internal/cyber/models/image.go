package models

type ImageStatus string

const (
	ImageStatusUnknown   ImageStatus = "unknown"   // 初始/未知
	ImageStatusPulling   ImageStatus = "pulling"   // 拉取中
	ImageStatusReady     ImageStatus = "ready"     // 可用
	ImageStatusMissing   ImageStatus = "missing"   // 不存在
	ImageStatusFailed    ImageStatus = "failed"    // 拉取失败
	ImageStatusVerifying ImageStatus = "verifying" // 校验中
	ImageStatusDeleting  ImageStatus = "deleting"  // 删除中
)

// Image 镜像
type Image struct {
	ID          string      `gorm:"primary_key" json:"id"`
	Name        string      `json:"name"`         // 名称
	Description string      `json:"description"`  // 详情
	Registry    string      `json:"registry"`     // 镜像仓库地址
	CpuLimit    float64     `json:"cpu_limit"`    // CPU限制
	MemoryLimit int64       `json:"memory_limit"` // 内存限制(MB)
	Exposed     string      `json:"exposed"`      // 暴露端口
	Status      ImageStatus `json:"status"`       // 状态

	CreatedAt int64 `json:"created_at" gorm:"autoCreateTime:milli"` // 创建时间
	UpdatedAt int64 `json:"updated_at" gorm:"autoUpdateTime:milli"` // 更新时间
}

func (m Image) TableName() string {
	return "images"
}
