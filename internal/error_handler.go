package internal

import (
	"errors"
	"net/http"

	"github.com/dushixiang/cyberpoc/pkg/xe"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

func WithErrorHandler(logger *zap.Logger) func(next echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if err := next(c); err != nil {
				var he *echo.HTTPError
				if errors.As(err, &he) {
					return c.JSON(he.Code, orz.Map{
						"code":    he.Code,
						"message": err.Error(),
					})
				}

				var oe *orz.Error
				if errors.As(err, &oe) {
					var code = 400
					if errors.Is(err, xe.ErrInvalidToken) {
						code = http.StatusUnauthorized
					}
					return c.JSON(code, orz.Map{
						"code":    oe.Code,
						"message": err.Error(),
					})
				}

				logger.Sugar().Error("api", zap.Error(err))

				return c.JSON(500, orz.Map{
					"code":    500,
					"message": err.Error(),
				})
			}
			return nil
		}
	}
}
