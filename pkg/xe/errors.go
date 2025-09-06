package xe

import "github.com/go-orz/orz"

var (
	ErrInvalidParams        = orz.NewError(10400, "参数无效")
	ErrInvalidToken         = orz.NewError(10403, "令牌无效")
	ErrPermissionDenied     = orz.NewError(10401, "您没有权限查看/修改/删除此数据")
	ErrInvalidAvatar        = orz.NewError(10002, "图片格式不正确或大小超过限制")
	ErrIncorrectOldPassword = orz.NewError(10003, "原密码错误")
	ErrAccountIncorrect     = orz.NewError(20005, "账户或密码错误")
	ErrAccountAlreadyUsed   = orz.NewError(10000, "账户已被使用")
	ErrAccountDisabled      = orz.NewError(10001, "账户已被禁用")
	ErrAccountNotFound      = orz.NewError(10001, "账户不存在")
	ErrCaptchaIncorrect     = orz.NewError(20006, "验证码错误")
	ErrFailedCaptcha        = orz.NewError(400, "图片验证码错误")
	ErrFailedCode           = orz.NewError(400, "邮箱验证码错误")
	ErrFailedMailDuplicate  = orz.NewError(400, "邮箱已被使用")
	ErrAccountDuplicate     = orz.NewError(400, "名称已被使用")

	ErrChallengeAlreadyExists = orz.NewError(20001, "该题目已启动")
	ErrSystemBusy             = orz.NewError(20002, "系统资源不足，请稍后再启动环境")
	ErrChallengeNotFound      = orz.NewError(20003, "题目不存在")
	ErrImageNotFound          = orz.NewError(20004, "镜像不存在")
	ErrInstanceNotFound       = orz.NewError(20004, "环境不存在")
)
