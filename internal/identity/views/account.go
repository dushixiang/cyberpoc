package views

import "github.com/mileusna/useragent"

type LoginAccount struct {
	Account  string `json:"account"`
	Password string `json:"password"`
	Key      string `json:"key"`
	Captcha  string `json:"captcha"`

	IP        string `json:"-"`
	UserAgent string `json:"-"`
}

func (r LoginAccount) ParseUserAgent() useragent.UserAgent {
	return useragent.Parse(r.UserAgent)
}

type LoginOTP struct {
	Token    string `json:"token" validate:"required"`
	OTP      string `json:"otp" validate:"required"`
	Remember bool   `json:"remember"`
}

type LoginResult struct {
	Token string `json:"token"` // token
	OTP   bool   `json:"otp"`   // 是否需要OTP验证
}

type ChangePassword struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

type ChangeProfile struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type SendCode struct {
	Mail string `json:"mail" validate:"required,email"`
}

type RegisterAccount struct {
	Account  string `json:"account" validate:"required,email"`
	Password string `json:"password" validate:"required"`
	Name     string `json:"name" validate:"required,min=3,max=32"`
	Captcha  string `json:"captcha" validate:"required"`
	Key      string `json:"key" validate:"required"`
	Code     string `json:"code" validate:"required"`
}

type ForgotPasswordRequest struct {
	Account    string `json:"account" validate:"required"`
	Captcha    string `json:"captcha" validate:"required"`
	CaptchaKey string `json:"captchaKey" validate:"required"`

	IP        string `json:"-"`
	UserAgent string `json:"-"`
}

type ResetPasswordRequest struct {
	Token      string `json:"token" validate:"required"`
	Captcha    string `json:"captcha" validate:"required"`
	CaptchaKey string `json:"captchaKey" validate:"required"`
	Password   string `json:"password" validate:"required"`

	IP        string `json:"-"`
	UserAgent string `json:"-"`
}
