package handler

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

func NewInstanceHandler(instanceService *service.InstanceService) *InstanceHandler {
	return &InstanceHandler{
		instanceService: instanceService,
	}
}

type InstanceHandler struct {
	instanceService *service.InstanceService
}

func (h InstanceHandler) Paging(c echo.Context) error {
	pr := orz.GetPageRequest(c, "created_at")

	builder := orz.NewPageBuilder(h.instanceService.Repository).
		PageRequest(pr)

	ctx := c.Request().Context()
	page, err := builder.Execute(ctx)
	if err != nil {
		return err
	}

	return orz.Ok(c, orz.Map{
		"items": page.Items,
		"total": page.Total,
	})
}

func (h InstanceHandler) Destroy(c echo.Context) error {
	id := c.Param("id")
	err := h.instanceService.Destroy(c.Request().Context(), id)
	return err
}
