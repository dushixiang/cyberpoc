package identity

import (
	"github.com/dushixiang/cyberpoc/pkg/nostd"
	"github.com/dushixiang/cyberpoc/pkg/xe"
	"github.com/labstack/echo/v4"
)

func (a *App) AccountId(c echo.Context) string {
	token := nostd.GetToken(c)
	accountId, _ := a.dependency.AccountService.AccountId(token)
	return accountId
}

func (a *App) IsAdmin(c echo.Context) bool {
	token := nostd.GetToken(c)
	return a.dependency.AccountService.IsAdmin(token)
}

func (a *App) Admin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if a.IsAdmin(c) {
			return next(c)
		}
		return xe.ErrPermissionDenied
	}
}

func (a *App) Auth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if a.AccountId(c) != "" {
			return next(c)
		}
		return xe.ErrInvalidToken
	}
}
