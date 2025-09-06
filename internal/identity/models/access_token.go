package models

type AccessToken struct {
	ID        string   `json:"id"`
	UserId    string   `json:"userId"`
	UserType  UserType `json:"userType"`
	CreatedAt int64    `json:"created_at"` // 创建时间
}

func (r AccessToken) TableName() string {
	return "access_tokens"
}

func (r AccessToken) IsAdmin() bool {
	return r.UserType == AdminUser
}
