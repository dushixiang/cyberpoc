package views

import (
	"github.com/dushixiang/cyberpoc/internal/identity/models"
)

type UserCreateRequest struct {
	ID       string          `json:"id"`       // 用户ID
	Name     string          `json:"name"`     // 名称
	Account  string          `json:"account"`  // 账户(邮箱)
	Password string          `json:"password"` // 密码
	Type     models.UserType `json:"type"`     // 用户类型
	Avatar   string          `json:"avatar"`   // 头像
}

type AdminChangePassword struct {
	Password string `json:"password" validate:"required"`
}
