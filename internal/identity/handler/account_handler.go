package handler

import (
	"github.com/dushixiang/cyberpoc/internal/identity/service"
	"github.com/dushixiang/cyberpoc/internal/identity/views"
	"github.com/dushixiang/cyberpoc/pkg/nostd"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

func NewAccountHandler(accountService *service.AccountService, userService *service.UserService) *AccountHandler {
	return &AccountHandler{
		accountService: accountService,
		userService:    userService,
	}
}

type AccountHandler struct {
	accountService *service.AccountService
	userService    *service.UserService
}

func (r AccountHandler) Login(c echo.Context) error {
	var account views.LoginAccount
	if err := c.Bind(&account); err != nil {
		return err
	}
	if err := c.Validate(&account); err != nil {
		return err
	}
	ctx := c.Request().Context()
	account.IP = c.RealIP()
	account.UserAgent = c.Request().UserAgent()

	accessToken, err := r.accountService.Login(ctx, account, true)
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{
		"token": accessToken.ID,
	})
}

func (r AccountHandler) Logout(c echo.Context) error {
	ctx := c.Request().Context()
	token := nostd.GetToken(c)
	return r.accountService.Logout(ctx, token)
}

func (r AccountHandler) AccountId(c echo.Context) string {
	token := nostd.GetToken(c)
	accountId, ok := r.accountService.AccountId(token)
	if !ok {
		return ""
	}
	return accountId
}

func (r AccountHandler) Info(c echo.Context) error {
	token := nostd.GetToken(c)
	ctx := c.Request().Context()

	userId, _ := r.accountService.AccountId(token)
	item, err := r.userService.FindById(ctx, userId)
	if err != nil {
		return err
	}
	return orz.Ok(c, item)
}

func (r AccountHandler) ChangeProfile(c echo.Context) error {
	var item views.ChangeProfile
	if err := c.Bind(&item); err != nil {
		return err
	}
	token := nostd.GetToken(c)
	userId, _ := r.accountService.AccountId(token)
	ctx := c.Request().Context()
	return r.userService.ChangeProfile(ctx, userId, item)
}

func (r AccountHandler) ChangePassword(c echo.Context) error {
	var cp views.ChangePassword
	if err := c.Bind(&cp); err != nil {
		return err
	}
	token := nostd.GetToken(c)
	userId, _ := r.accountService.AccountId(token)
	ctx := c.Request().Context()
	err := r.userService.ChangePasswordBySelf(ctx, userId, cp)
	if err != nil {
		return err
	}
	return r.Logout(c)
}

func (r AccountHandler) Captcha(c echo.Context) error {
	key, base64Captcha, err := r.accountService.GetCaptcha()
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{
		"captcha": base64Captcha,
		"key":     key,
	})
}

func (r AccountHandler) Register(c echo.Context) error {
	var item views.RegisterAccount
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}
	return r.accountService.Register(c.Request().Context(), item)
}

func (r AccountHandler) SendCode(c echo.Context) error {
	var item views.SendCode
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}
	return r.accountService.SendCode(c.Request().Context(), c.RealIP(), item)
}

func (r AccountHandler) ForgotPassword(c echo.Context) error {
	var item views.ForgotPasswordRequest
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}
	item.IP = c.RealIP()
	item.UserAgent = c.Request().UserAgent()
	return r.accountService.ForgotPassword(c.Request().Context(), item)
}

func (r AccountHandler) ResetPassword(c echo.Context) error {
	var item views.ResetPasswordRequest
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}
	item.IP = c.RealIP()
	item.UserAgent = c.Request().UserAgent()
	return r.accountService.ResetPassword(c.Request().Context(), item)
}
