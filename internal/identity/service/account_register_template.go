package service

import (
	"bytes"
	"fmt"
	"text/template"
)

const accountRegisterCodeTemplate = `你好，

欢迎注册 {{.SystemName}}！你的邮箱验证码为：{{.Code}}

请在 5 分钟内完成验证。为保护你的账户安全，请勿向任何人泄露此验证码。

如非你本人操作，请忽略此邮件。

——  
安全提醒：  
操作时间：{{.GenerateTime}}
来源 IP：{{.IP}}`

var (
	registerCodeTmpl = template.Must(template.New("account_register_code").Parse(accountRegisterCodeTemplate))
)

type AccountRegisterCodeTemplate struct {
	SystemName   string
	Code         string
	IP           string
	GenerateTime string
}

// 通用格式化函数
func (r *AccountRegisterCodeTemplate) formatTemplate(tmpl *template.Template) (string, error) {
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, r); err != nil {
		return "", fmt.Errorf("执行模板失败: %w", err)
	}
	return buf.String(), nil
}

func (r *AccountRegisterCodeTemplate) Format() (string, error) {
	return r.formatTemplate(registerCodeTmpl)
}
