package handler

import (
	"github.com/dushixiang/cyberpoc/internal/identity/service"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

func NewPropertyHandler(propertyService *service.PropertyService) *PropertyHandler {
	return &PropertyHandler{
		propertyService: propertyService,
	}
}

type PropertyHandler struct {
	propertyService *service.PropertyService
}

func (r PropertyHandler) Set(c echo.Context) error {
	var data map[string]interface{}
	if err := c.Bind(&data); err != nil {
		return err
	}
	ctx := c.Request().Context()
	return r.propertyService.Set(ctx, data)
}

func (r PropertyHandler) Get(c echo.Context) error {
	ctx := c.Request().Context()
	data, err := r.propertyService.Get(ctx)
	if err != nil {
		return err
	}
	return orz.Ok(c, data)
}
