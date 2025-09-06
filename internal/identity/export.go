package identity

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/labstack/echo/v4"
)

func GetSystemConfig(ctx context.Context) (*models.SystemConfig, error) {
	return Instance().dependency.PropertyService.GetSystemConfig(ctx)
}

func AccountId(c echo.Context) string {
	return Instance().AccountId(c)
}

func Auth() func(next echo.HandlerFunc) echo.HandlerFunc {
	return Instance().Auth
}

func Admin() func(next echo.HandlerFunc) echo.HandlerFunc {
	return Instance().Admin
}

func GetUserById(ctx context.Context, userId string) (models.User, error) {
	return Instance().dependency.UserService.FindById(ctx, userId)
}
