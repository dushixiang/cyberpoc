package service

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/repo"
	"github.com/dushixiang/cyberpoc/internal/identity"
	"github.com/dushixiang/cyberpoc/pkg/tools"
	"github.com/dushixiang/cyberpoc/pkg/xe"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/go-orz/cache"
	"github.com/go-orz/orz"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InstanceService struct {
	*orz.Service
	*repo.InstanceRepo
	sync.Mutex

	logger *zap.Logger
	conf   *config.Config

	challengeService       *ChallengeService
	challengeRecordService *ChallengeRecordService
	imageService           *ImageService
	solveService           *SolveService
	reverseProxyService    *ReverseProxyService
	client                 *client.Client

	timer cache.Cache[string, bool]
}

func NewInstanceService(db *gorm.DB, logger *zap.Logger, conf *config.Config, challengeService *ChallengeService, challengeRecordService *ChallengeRecordService, imageService *ImageService,
	solveService *SolveService, reverseProxyService *ReverseProxyService) *InstanceService {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(fmt.Errorf("初始化Docker客户端失败: %v", err))
	}

	service := InstanceService{
		Service:                orz.NewService(db),
		InstanceRepo:           repo.NewInstanceRepo(db),
		logger:                 logger,
		conf:                   conf,
		challengeService:       challengeService,
		challengeRecordService: challengeRecordService,
		imageService:           imageService,
		solveService:           solveService,
		reverseProxyService:    reverseProxyService,
		client:                 cli,
	}
	timer := cache.New[string, bool](time.Minute, cache.Option[string, bool]{
		OnEvicted: service.OnInstanceEvicted,
	})
	service.timer = timer

	return &service
}

func (s *InstanceService) Run(ctx context.Context, userId, challengeId string) error {
	s.Lock()
	defer s.Unlock()

	instanceId := tools.Md5Sign(userId, challengeId)

	exists, err := s.InstanceRepo.ExistsById(ctx, instanceId)
	if err != nil {
		return err
	}
	if exists {
		return xe.ErrChallengeAlreadyExists
	}

	// 可同时启动环境校验
	systemConfig, err := identity.GetSystemConfig(ctx)
	if err != nil {
		return err
	}
	if systemConfig.MaxChallengeCount > 0 {
		// 查询当前系统已启动了多少个环境
		runningCount, err := s.InstanceRepo.Count(ctx)
		if err != nil {
			return err
		}
		if runningCount >= int64(systemConfig.MaxChallengeCount) {
			return xe.ErrSystemBusy
		}
	}

	challenge, exists, err := s.challengeService.FindByIdExists(ctx, challengeId)
	if err != nil {
		return err
	}
	if !exists {
		return xe.ErrChallengeNotFound
	}
	image, exists, err := s.imageService.FindByIdExists(ctx, challenge.ImageId)
	if err != nil {
		return err
	}
	if !exists {
		return xe.ErrImageNotFound
	}

	user, err := identity.GetUserById(ctx, userId)
	if err != nil {
		return err
	}

	var (
		userName      = user.Name
		challengeName = challenge.Name
		flag          = challenge.Flag
	)

	if challenge.DynamicFlag {
		flag = fmt.Sprintf(`cyberpoc-{%s}`, uuid.NewString())
	}

	var (
		subdomain string
		accessUrl string
	)
	if s.conf.Gateway.Enabled {
		subdomain, err = s.GenerateRandomSubdomain(ctx)
		if err != nil {
			return err
		}
		subdomain = strings.ToLower(subdomain)
		domain := s.conf.Gateway.Domain
		if s.conf.Gateway.Https {
			accessUrl = fmt.Sprintf(`https://%s.%s`, subdomain, domain)
		} else {
			accessUrl = fmt.Sprintf(`http://%s.%s`, subdomain, domain)
		}
	}

	instance := models.Instance{
		ID:            instanceId,
		UserId:        userId,
		UserName:      userName,
		ChallengeId:   challengeId,
		ChallengeName: challengeName,
		Flag:          flag,
		Exposed:       image.Exposed,
		Duration:      challenge.Duration,
		CpuLimit:      image.CpuLimit,
		MemoryLimit:   image.MemoryLimit,
		Status:        models.InstanceStatusCreating,
		Subdomain:     subdomain,
		AccessUrl:     accessUrl,
		Message:       "",
		CreatedAt:     time.Now().UnixMilli(),
		ExpiresAt:     time.Now().Add(time.Duration(challenge.Duration) * time.Minute).UnixMilli(),
	}

	// 启动环境
	cli := s.DockerClient()

	cc := container.Config{
		Env:   []string{"flag=" + flag},
		Image: image.Registry,
	}

	var renderExposed = func(exposed string) nat.PortMap {
		ports := strings.Split(exposed, ",")
		var bindings = make(nat.PortMap, len(ports))
		for _, port := range ports {
			bindings[nat.Port(port+"/tcp")] = []nat.PortBinding{
				{
					HostPort: "",
				},
			}
		}
		return bindings
	}

	hostConfig := container.HostConfig{
		Resources: container.Resources{
			Memory:   int64(image.MemoryLimit) * 1024 * 1024, // bytes
			NanoCPUs: int64(1000000000 * image.CpuLimit),
		},
		PortBindings: renderExposed(instance.Exposed),
		AutoRemove:   true, // 关闭时自动销毁
	}

	networkingConfig := network.NetworkingConfig{}

	s.logger.Debug("create container", zap.Any("instance", instance))
	_, err = cli.ContainerCreate(ctx, &cc, &hostConfig, &networkingConfig, nil, instance.ID)
	if err != nil {
		s.logger.Debug("create container err:", zap.NamedError("err", err))
		return err
	}

	// 创建 环境
	err = s.InstanceRepo.Create(ctx, &instance)
	if err != nil {
		return err
	}
	// 创建挑战记录
	challengeRecord := models.ChallengeRecord{
		ID:            uuid.NewString(),
		UserId:        userId,
		UserName:      userName,
		ChallengeId:   challengeId,
		ChallengeName: challengeName,
		InstanceId:    instance.ID,
		CreatedAt:     time.Now().UnixMilli(),
	}
	_ = s.challengeRecordService.Create(ctx, &challengeRecord)

	go func() {
		ctx := context.Background()
		err := s.startContainer(ctx, instance.ID)
		if err != nil {
			s.logger.Warn("启动容器失败", zap.Error(err))
			_ = s.UpdateStatus(ctx, instance.ID, models.InstanceStatusCreateFailure, err.Error())
		}
	}()

	return nil
}

func (s *InstanceService) GenerateRandomSubdomain(ctx context.Context) (string, error) {
	instances, err := s.InstanceRepo.FindAll(ctx)
	if err != nil {
		return "", err
	}
	var usedSubdomains = make(map[string]bool)
	for _, instance := range instances {
		usedSubdomains[instance.Subdomain] = true
	}

	for {
		select {
		case <-ctx.Done():
			return "", fmt.Errorf("生成随机子域名超时")
		default:
			subdomain := tools.RandomId(8)
			if !usedSubdomains[subdomain] {
				return subdomain, nil
			}
		}
	}
}

func (s *InstanceService) UpdateStatus(ctx context.Context, id string, status models.InstanceStatus, message string) error {
	err := s.InstanceRepo.UpdateColumnsById(ctx, id, orz.Map{
		"status":  status,
		"message": message,
	})
	return err
}

func (s *InstanceService) ReStartContainers(ctx context.Context) error {
	instances, err := s.InstanceRepo.FindAll(ctx)
	if err != nil {
		return err
	}
	for _, instance := range instances {
		err = s.startContainer(ctx, instance.ID)
		if err != nil {
			s.logger.Error("start container", zap.String("id", instance.ID), zap.NamedError("err", err))
		}
	}
	return nil
}

func (s *InstanceService) Destroy(ctx context.Context, id string) error {
	exists, err := s.InstanceRepo.ExistsById(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}

	err = s.UpdateStatus(ctx, id, models.InstanceStatusDeleting, "")
	if err != nil {
		return err
	}

	go func() {
		ctx := context.Background()
		err := s.destroy(ctx, id)
		if err != nil {
			s.logger.Error("destroy", zap.String("id", id), zap.NamedError("err", err))
			_ = s.UpdateStatus(ctx, id, models.InstanceStatusDeleteFailure, err.Error())
		}
	}()

	return nil
}

func (s *InstanceService) destroy(ctx context.Context, id string) error {
	exists, err := s.InstanceRepo.ExistsById(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}
	cli := s.DockerClient()
	s.logger.Debug("container destroy", zap.String("id", id))
	err = cli.ContainerRemove(ctx, id, container.RemoveOptions{
		Force: true,
	})
	if err != nil && !strings.Contains(err.Error(), "No such container") {
		return err
	}

	_ = s.DeleteById(ctx, id)
	return nil
}

func (s *InstanceService) SubmitFlag(ctx context.Context, id, flag string) (bool, error) {
	s.Lock()
	defer s.Unlock()

	exists, err := s.InstanceRepo.ExistsById(ctx, id)
	if err != nil {
		return false, err
	}
	if !exists {
		return false, nil
	}

	instance, exists, err := s.InstanceRepo.FindByIdExists(ctx, id)
	if err != nil {
		return false, err
	}
	if !exists {
		return false, xe.ErrInstanceNotFound
	}
	if !strings.EqualFold(instance.Flag, flag) {
		return false, nil
	}

	// 通过 ✅
	challenge, err := s.challengeService.FindById(ctx, instance.ChallengeId)
	if err != nil {
		return false, err
	}
	// 查询是否通关过
	items, err := s.solveService.FindByChallengeIdAndUserId(ctx, instance.ChallengeId, instance.UserId)
	if err != nil {
		return false, err
	}

	// 保存通关记录
	now := time.Now()
	usedTime := now.Sub(time.UnixMilli(instance.CreatedAt))

	if len(items) > 0 {
		solve := items[0]
		// 只能刷耗时，但是不能更改一血的通关时间
		solve.UsedTime = usedTime.Milliseconds()
		solve.UsedTimeStr = usedTime.Truncate(time.Second).String()
		err = s.solveService.UpdateById(ctx, &solve)
		if err != nil {
			return false, err
		}
	} else {
		ps := &models.Solve{
			ID:          uuid.NewString(),
			UserId:      instance.UserId,
			ChallengeId: instance.ChallengeId,
			Points:      challenge.Points,
			StartAt:     instance.CreatedAt,
			SolvedAt:    now.UnixMilli(),
			UsedTime:    usedTime.Milliseconds(),
			UsedTimeStr: usedTime.Truncate(time.Second).String(), // 只保留到秒
		}
		err = s.solveService.Create(ctx, ps)
		if err != nil {
			return false, err
		}
	}
	// 销毁环境
	_ = s.Destroy(ctx, id)
	return true, nil
}

func (s *InstanceService) FindByIdWithNoNotExistsError(ctx context.Context, id string) (*models.Instance, error) {
	instance, exists, err := s.InstanceRepo.FindByIdExists(ctx, id)
	if err != nil {
		return nil, err
	}
	if !exists {
		return &models.Instance{}, nil
	}
	return &instance, nil
}

func (s *InstanceService) startContainer(ctx context.Context, id string) error {
	s.logger.Debug("container start", zap.String("id", id))
	cli := s.DockerClient()
	err := cli.ContainerStart(ctx, id, container.StartOptions{})
	if err != nil {
		return fmt.Errorf("container start err: %w", err)
	}

	instance, err := s.InstanceRepo.FindById(ctx, id)
	if err != nil {
		return err
	}

	var started = false
	for !started {
		// 循环查询容器的状态
		inspect, err := cli.ContainerInspect(ctx, id)
		if err != nil {
			s.logger.Error("container inspect", zap.String("id", id), zap.NamedError("err", err))
			return err
		}

		networkSettings := inspect.NetworkSettings
		if networkSettings == nil {
			continue
		}
		time.Sleep(time.Second)
		var ports []string
		bindings := networkSettings.Ports
		for _, portBindings := range bindings {
			for _, binding := range portBindings {
				if binding.HostPort == "" || binding.HostPort == "0" {
					continue
				}
				ports = append(ports, binding.HostPort)
			}
		}

		if len(ports) == 0 {
			continue
		}

		if s.conf.Gateway.Enabled {
			var localAddr = "127.0.0.1:" + ports[0]
			s.reverseProxyService.AddApp(instance.Subdomain, App{
				Host:     localAddr,
				Protocol: "http",
			})
		} else {
			var accessUrl = ports[0]
			_ = s.UpdateColumnsById(ctx, id, orz.Map{
				"access_url": accessUrl,
			})
		}

		started = true
		_ = s.UpdateStatus(ctx, id, models.InstanceStatusRunning, "")
	}

	now := time.Now()

	expiresAt := time.UnixMilli(instance.ExpiresAt)
	if expiresAt.Before(now) {
		err := s.Destroy(context.Background(), id)
		if err != nil {
			s.logger.Error("container destroy", zap.String("id", id), zap.NamedError("err", err))
			return err
		}
	} else {
		duration := expiresAt.Sub(now)
		// 启动定时器，等待一段时间后销毁
		s.logger.Debug("timer create", zap.String("id", id), zap.String("duration", duration.String()))
		// 存储定时器
		s.timer.Set(id, true, duration)
	}
	return nil
}

func (s *InstanceService) DockerClient() *client.Client {
	return s.client
}

func (s *InstanceService) OnInstanceEvicted(id string, _ bool) {
	go func() {
		err := s.Destroy(context.Background(), id)
		if err != nil {
			s.logger.Error("compose destroy", zap.String("id", id), zap.NamedError("err", err))
		}
	}()
}
