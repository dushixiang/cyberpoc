package handler

import (
	"github.com/dushixiang/cyberpoc/internal/cyber/service"
	"github.com/dushixiang/cyberpoc/internal/cyber/views"
	"github.com/dushixiang/cyberpoc/internal/identity"
	"github.com/dushixiang/cyberpoc/pkg/tools"
	"github.com/dushixiang/cyberpoc/pkg/xe"
	"github.com/go-orz/orz"
	"github.com/labstack/echo/v4"
)

func NewIndexHandler(challengeService *service.ChallengeService, instanceService *service.InstanceService,
	solveService *service.SolveService, challengeRecordService *service.ChallengeRecordService, rankService *service.RankService) *IndexHandler {
	return &IndexHandler{
		challengeService:       challengeService,
		instanceService:        instanceService,
		solveService:           solveService,
		challengeRecordService: challengeRecordService,
		rankService:            rankService,
	}
}

type IndexHandler struct {
	challengeService       *service.ChallengeService
	instanceService        *service.InstanceService
	solveService           *service.SolveService
	challengeRecordService *service.ChallengeRecordService
	rankService            *service.RankService
}

func (r IndexHandler) ChallengePaging(c echo.Context) error {
	name := c.QueryParam("name")
	category := c.QueryParam("category")
	difficulty := c.QueryParam("difficulty")
	pr := orz.GetPageRequest(c)

	builder := orz.NewPageBuilder(r.challengeService.Repository).
		PageRequest(pr).
		Equal("enabled", true).
		Contains("name", name).
		Contains("category", category).
		Contains("difficulty", difficulty).
		SortByDesc("sort", "sort")

	ctx := c.Request().Context()
	page, err := builder.Execute(ctx)
	if err != nil {
		return err
	}

	var challengeIds = make([]string, 0, len(page.Items))
	for _, item := range page.Items {
		challengeIds = append(challengeIds, item.ID)
	}
	groupCount1, err := r.challengeRecordService.GroupCountByChallengeIdIn(ctx, challengeIds)
	if err != nil {
		return err
	}

	groupCount2, err := r.solveService.GroupCountByChallengeIdIn(ctx, challengeIds)
	if err != nil {
		return err
	}

	var userGroup = make(map[string]int64)
	accountId := identity.AccountId(c)
	if accountId != "" {
		userGroup, err = r.solveService.GroupCountByChallengeIdInAndUserId(ctx, challengeIds, accountId)
		if err != nil {
			return err
		}
	}

	var challenges = make([]views.ChallengeSimple, 0, len(page.Items))
	for _, item := range page.Items {
		challenges = append(challenges, views.ChallengeSimple{
			ID:           item.ID,
			Name:         item.Name,
			Category:     item.Category,
			Difficulty:   item.Difficulty,
			Points:       item.Points,
			CreatedAt:    item.CreatedAt,
			UpdatedAt:    item.UpdatedAt,
			AttemptCount: groupCount1[item.ID],
			SolvedCount:  groupCount2[item.ID],
			Solved:       userGroup[item.ID] > 0,
		})
	}

	return orz.Ok(c, orz.Map{
		"items": challenges,
		"total": page.Total,
	})
}

func (r IndexHandler) GetChallenge(c echo.Context) error {
	challengeId := c.Param("challenge_id")
	ctx := c.Request().Context()
	challenge, exists, err := r.challengeService.FindByIdExists(ctx, challengeId)
	if err != nil {
		return err
	}
	if !exists {
		return xe.ErrChallengeNotFound
	}

	var view = views.ChallengeDetail{
		Challenge:    challenge,
		SolvedCount:  0,
		AttemptCount: 0,
	}
	attemptCount, err := r.challengeRecordService.CountByChallengeId(ctx, challengeId)
	if err != nil {
		return err
	}
	view.AttemptCount = attemptCount
	solvedCount, err := r.solveService.CountByChallengeId(ctx, challengeId)
	if err != nil {
		return err
	}
	view.SolvedCount = solvedCount

	accountId := identity.AccountId(c)
	if accountId != "" {
		count, err := r.solveService.CountByChallengeIdAndUserId(ctx, challengeId, accountId)
		if err != nil {
			return err
		}
		view.Solved = count > 0
	}

	return orz.Ok(c, view)
}

func (r IndexHandler) GetChallengeRank(c echo.Context) error {
	challengeId := c.Param("challenge_id")
	ctx := c.Request().Context()
	solves, err := r.solveService.FindByChallengeIdWithLimit(ctx, challengeId, 10)
	if err != nil {
		return err
	}
	first, err := r.solveService.FindFirstByChallengeId(ctx, challengeId)
	if err != nil {
		return err
	}
	var data = orz.Map{
		"solves": solves,
	}
	if len(first) > 0 {
		data["first"] = first[0]
	}

	return orz.Ok(c, data)
}

func (r IndexHandler) GetInstance(c echo.Context) error {
	challengeId := c.Param("challenge_id")
	ctx := c.Request().Context()
	accountId := identity.AccountId(c)
	instanceId := tools.Md5Sign(accountId, challengeId)

	instance, err := r.instanceService.FindByIdWithNoNotExistsError(ctx, instanceId)
	if err != nil {
		return err
	}
	if instance.ID != "" {
		v := &views.InstanceView{
			AccessUrl: instance.AccessUrl,
			CreatedAt: instance.CreatedAt,
			ExpiresAt: instance.ExpiresAt,
			Status:    string(instance.Status),
		}
		return orz.Ok(c, v)
	}
	return orz.Ok(c, orz.Map{})
}

func (r IndexHandler) ChallengeRun(c echo.Context) error {
	challengeId := c.Param("challenge_id")
	ctx := c.Request().Context()
	accountId := identity.AccountId(c)
	return r.instanceService.Run(ctx, accountId, challengeId)
}

func (r IndexHandler) DestroyInstance(c echo.Context) error {
	challengeId := c.Param("challenge_id")
	ctx := c.Request().Context()
	accountId := identity.AccountId(c)

	instanceId := tools.Md5Sign(accountId, challengeId)
	return r.instanceService.Destroy(ctx, instanceId)
}

type Flag struct {
	Flag string `json:"flag"`
}

func (r IndexHandler) SubmitFlag(c echo.Context) error {
	challengeId := c.Param("challenge_id")
	ctx := c.Request().Context()
	accountId := identity.AccountId(c)
	var flag Flag
	if err := c.Bind(&flag); err != nil {
		return err
	}

	instanceId := tools.Md5Sign(accountId, challengeId)
	ok, err := r.instanceService.SubmitFlag(ctx, instanceId, flag.Flag)
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{
		"ok": ok,
	})
}

func (r IndexHandler) GetRanks(c echo.Context) error {
	ctx := c.Request().Context()
	items, err := r.rankService.List(ctx, 100)
	if err != nil {
		return err
	}
	ts, err := r.rankService.LastUpdatedAt(ctx)
	if err != nil {
		return err
	}
	return orz.Ok(c, orz.Map{
		"items":      items,
		"updated_at": ts,
	})
}
