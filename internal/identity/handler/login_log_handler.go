package handler

import (
	"github.com/dushixiang/cyberpoc/internal/identity/service"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

type LoginLogHandler struct {
	loginLogService *service.LoginLogService
}

func NewLoginLogHandler(loginLogService *service.LoginLogService) *LoginLogHandler {
	return &LoginLogHandler{loginLogService: loginLogService}
}

func (h LoginLogHandler) Paging(c echo.Context) error {
	account := c.QueryParam("account")
	ip := c.QueryParam("ip")
	success := c.QueryParam("success")
	
	pr := orz.GetPageRequest(c, "login_at")
	builder := orz.NewPageBuilder(h.loginLogService.Repository).
		PageRequest(pr).
		Contains("account", account).
		Contains("ip", ip).
		Equal("success", success)

	page, err := builder.Execute(c.Request().Context())
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{"items": page.Items, "total": page.Total})
}

func (h LoginLogHandler) DeleteAll(c echo.Context) error {
	err := h.loginLogService.DeleteAll(c.Request().Context())
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{"ok": true})
}