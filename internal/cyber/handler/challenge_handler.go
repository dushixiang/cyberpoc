package handler

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
	"github.com/go-orz/orz"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type ChallengeHandler struct {
	challengeService       *service.ChallengeService
	challengeRecordService *service.ChallengeRecordService
}

func NewChallengeHandler(challengeService *service.ChallengeService, challengeRecordService *service.ChallengeRecordService) *ChallengeHandler {
	return &ChallengeHandler{
		challengeService:       challengeService,
		challengeRecordService: challengeRecordService,
	}
}

func (r ChallengeHandler) Paging(c echo.Context) error {
	name := c.QueryParam("name")

	pr := orz.GetPageRequest(c, "created_at", "sort")

	builder := orz.NewPageBuilder(r.challengeService.Repository).
		PageRequest(pr).
		Contains("name", name)

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

// Sort 对题目进行拖拽排序，接收 [{id, sortOrder}]
func (r ChallengeHandler) Sort(c echo.Context) error {
	var items []struct {
		ID   string `json:"id"`
		Sort int64  `json:"sort"`
	}
	if err := c.Bind(&items); err != nil {
		return err
	}
	if len(items) == 0 {
		return orz.BadRequest(c, "items is empty")
	}

	ctx := c.Request().Context()
	for _, item := range items {
		if item.ID == "" {
			continue
		}
		if err := r.challengeService.UpdateColumnsById(ctx, item.ID, orz.Map{
			"sort": item.Sort,
		}); err != nil {
			return err
		}
	}
	return orz.Ok(c, orz.Map{"ok": true})
}

func (r ChallengeHandler) Create(c echo.Context) error {
	var item models.Challenge
	if err := c.Bind(&item); err != nil {
		return err
	}
	if err := c.Validate(&item); err != nil {
		return err
	}

	item.ID = uuid.NewString()
	ctx := c.Request().Context()
	return r.challengeService.Create(ctx, &item)
}

func (r ChallengeHandler) Get(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()
	item, err := r.challengeService.FindById(ctx, id)
	if err != nil {
		return err
	}
	return orz.Ok(c, item)
}

func (r ChallengeHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var item models.Challenge
	if err := c.Bind(&item); err != nil {
		return err
	}
	item.ID = id

	ctx := c.Request().Context()

	return r.challengeService.UpdateById(ctx, &item)
}

func (r ChallengeHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	ctx := c.Request().Context()
	return r.challengeService.DeleteById(ctx, id)
}

func (r ChallengeHandler) ChallengeRecordPaging(c echo.Context) error {
	pr := orz.GetPageRequest(c, "created_at")

	builder := orz.NewPageBuilder(r.challengeRecordService.Repository).
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
