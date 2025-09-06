package handler

import (
	"context"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
	"github.com/dushixiang/cyberpoc/internal/cyber/views"
	"github.com/go-orz/orz"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type ImageHandler struct {
	imageService *service.ImageService
}

func NewImageHandler(imageService *service.ImageService) *ImageHandler {
	return &ImageHandler{imageService: imageService}
}

func (r ImageHandler) Paging(c echo.Context) error {
	name := c.QueryParam("name")
	registry := c.QueryParam("registry")

	pr := orz.GetPageRequest(c, "created_at", "name")

	builder := orz.NewPageBuilder(r.imageService.Repository).
		PageRequest(pr).
		Contains("name", name).
		Contains("registry", registry)

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

func (r ImageHandler) Create(c echo.Context) error {
	var item models.Image
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}
	item.ID = uuid.NewString()

	ctx := c.Request().Context()
	if err := r.imageService.Create(ctx, &item); err != nil {
		return err
	}

	// 创建成功后自动拉取镜像
	go func() {
		_ = r.imageService.Pull(context.Background(), item.ID)
	}()

	return orz.Ok(c, orz.Map{"ok": true})
}

func (r ImageHandler) Get(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()
	item, err := r.imageService.FindById(ctx, id)
	if err != nil {
		return err
	}
	return orz.Ok(c, item)
}

func (r ImageHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.Image
	if err := c.Bind(&item); err != nil {
		return err
	}
	item.ID = id

	ctx := c.Request().Context()

	return r.imageService.UpdateById(ctx, &item)
}

func (r ImageHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()

	// 先删除本地Docker镜像
	_ = r.imageService.RemoveLocal(ctx, id)

	// 再删除数据库记录
	return r.imageService.DeleteById(ctx, id)
}

func (r ImageHandler) List(c echo.Context) error {
	images, err := r.imageService.FindAll(c.Request().Context())
	if err != nil {
		return err
	}
	var items = make([]views.SimpleView, 0, len(images))
	for _, image := range images {
		items = append(items, views.SimpleView{
			ID:   image.ID,
			Name: image.Name,
		})
	}
	return orz.Ok(c, items)
}

// SyncAll 同步所有镜像的本地状态
func (r ImageHandler) SyncAll(c echo.Context) error {
	ctx := c.Request().Context()
	if err := r.imageService.SyncAllStatuses(ctx); err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{"ok": true})
}

// PullAll 拉取所有镜像（串行）
func (r ImageHandler) PullAll(c echo.Context) error {
	ctx := c.Request().Context()
	if err := r.imageService.PullAll(ctx); err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{"ok": true})
}

// Sync 同步单个镜像的本地状态
func (r ImageHandler) Sync(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()
	exists, err := r.imageService.Verify(ctx, id)
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{"exists": exists})
}

// Pull 拉取单个镜像
func (r ImageHandler) Pull(c echo.Context) error {
	id := c.Param("id")

	// 异步拉取镜像
	go func() {
		_ = r.imageService.Pull(context.Background(), id)
	}()

	return orz.Ok(c, orz.Map{"ok": true})
}
