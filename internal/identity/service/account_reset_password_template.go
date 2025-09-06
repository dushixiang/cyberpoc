package service

import (
	"bytes"
	"fmt"
	"text/template"
)

const beforeAccountResetPasswordTemplate = `你好 {{.UserName}},

我们收到了一个请求，要求重置你在 {{.SystemName}} 的账户密码。  
如果这是你本人操作，请在十分钟内点击下方链接完成密码重置：

{{.BaseURL}}/reset/{{.Token}}

如果你并未发起此请求，请忽略这封邮件，你的账户仍然是安全的。

如有任何疑问，欢迎直接回复此邮件与我们联系。

——  
安全提醒：  
该操作来源于 IP 地址 {{.IP}}，使用的浏览器为 {{.UserAgent}}，操作时间为 {{.GenerateTime}}。
`

const afterAccountResetPasswordTemplate = `你好 {{.UserName}},

你的 {{.SystemName}} 密码已于刚才成功更新。

如果此次密码更新不是你本人操作，建议立即登录 {{.SystemName}} 并修改密码，以确保账户安全：

{{.BaseURL}}

如有任何疑问，欢迎直接回复此邮件与我们联系。

——  
安全提醒：  
该操作来源于 IP 地址 {{.IP}}，使用的浏览器为 {{.UserAgent}}，操作时间为 {{.GenerateTime}}。
`

var (
	beforeTemplate = template.Must(template.New("before_account_reset_password").Parse(beforeAccountResetPasswordTemplate))
	afterTemplate  = template.Must(template.New("after_account_reset_password").Parse(afterAccountResetPasswordTemplate))
)

type AccountResetPasswordTemplate struct {
	BaseURL      string
	Token        string
	SystemName   string
	UserName     string
	IP           string
	UserAgent    string
	GenerateTime string
}

// 通用格式化函数
func (r *AccountResetPasswordTemplate) formatTemplate(tmpl *template.Template) (string, error) {
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, r); err != nil {
		return "", fmt.Errorf("执行模板失败: %w", err)
	}
	return buf.String(), nil
}

func (r *AccountResetPasswordTemplate) BeforeFormat() (string, error) {
	return r.formatTemplate(beforeTemplate)
}

func (r *AccountResetPasswordTemplate) AfterFormat() (string, error) {
	return r.formatTemplate(afterTemplate)
}
