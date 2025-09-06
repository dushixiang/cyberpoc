package handler

import (
	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/dushixiang/cyberpoc/internal/identity/service"
	"github.com/dushixiang/cyberpoc/internal/identity/views"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (r UserHandler) Paging(c echo.Context) error {
	name := c.QueryParam("name")
	mail := c.QueryParam("mail")
	typ := c.QueryParam("type")

	pr := orz.GetPageRequest(c, "created_at", "name")

	builder := orz.NewPageBuilder(r.userService.Repository).
		PageRequest(pr).
		Contains("name", name).
		Contains("mail", mail).
		Equal("type", typ)

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

func (r UserHandler) Create(c echo.Context) error {
	var item views.UserCreateRequest
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}

	ctx := c.Request().Context()
	return r.userService.Create(ctx, item)
}

func (r UserHandler) Get(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()
	item, err := r.userService.FindById(ctx, id)
	if err != nil {
		return err
	}
	return orz.Ok(c, item)
}

func (r UserHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.User
	if err := c.Bind(&item); err != nil {
		return err
	}
	item.ID = id
	item.Password = ""

	ctx := c.Request().Context()

	return r.userService.UpdateById(ctx, item)
}

func (r UserHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()
	return r.userService.DeleteById(ctx, id)
}

func (r UserHandler) ChangePassword(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()

	var item views.AdminChangePassword
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}
	_, err := r.userService.ChangePassword(ctx, id, item.Password)
	if err != nil {
		return err
	}
	return nil
}

func (r UserHandler) Enabled(c echo.Context) error {
	ctx := c.Request().Context()
	var item []string
	if err := c.Bind(&item); err != nil {
		return err
	}
	return r.userService.UpdateEnabledByIdIn(ctx, true, item)
}

func (r UserHandler) Disabled(c echo.Context) error {
	ctx := c.Request().Context()
	var item []string
	if err := c.Bind(&item); err != nil {
		return err
	}
	return r.userService.UpdateEnabledByIdIn(ctx, false, item)
}
