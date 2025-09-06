package models

type UserType string

const (
	AdminUser   UserType = "admin"
	RegularUser UserType = "regular"
)

type User struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`       // 名称
	Account   string   `json:"account"`    // 账户(邮箱)
	Password  string   `json:"-"`          // 密码
	Avatar    string   `json:"avatar"`     // 头像
	CreatedAt int64    `json:"created_at"` // 创建时间
	Enabled   bool     `json:"enabled"`    // 状态
	Type      UserType `json:"type"`       // 用户类型
}

func (r User) TableName() string {
	return "users"
}

func (r User) IsAdmin() bool {
	return r.Type == AdminUser
}
