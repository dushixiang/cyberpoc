package service

import (
	"context"
	"io"

	imagetypes "github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/dushixiang/cyberpoc/internal/cyber/repo"
	"github.com/dushixiang/cyberpoc/pkg/xe"
	"github.com/go-orz/orz"
	"gorm.io/gorm"
)

type ImageService struct {
	*orz.Service
	*repo.ImageRepo
	client *client.Client
}

func NewImageService(db *gorm.DB) *ImageService {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}
	return &ImageService{
		Service:   orz.NewService(db),
		ImageRepo: repo.NewImageRepo(db),
		client:    cli,
	}
}

func (s *ImageService) DockerClient() *client.Client {
	return s.client
}

// ExistsById 检查镜像是否存在
func (s *ImageService) ExistsById(ctx context.Context, id string) (bool, error) {
	_, exists, err := s.ImageRepo.FindByIdExists(ctx, id)
	return exists, err
}

func (s *ImageService) UpdateStatus(ctx context.Context, id string, status models.ImageStatus) error {
	return s.ImageRepo.UpdateColumnsById(ctx, id, orz.Map{
		"status": status,
	})
}

// Pull 拉取镜像到本地
func (s *ImageService) Pull(ctx context.Context, id string) error {
	img, exists, err := s.ImageRepo.FindByIdExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return xe.ErrImageNotFound
	}

	_ = s.UpdateStatus(ctx, id, models.ImageStatusPulling)

	cli := s.DockerClient()
	rc, err := cli.ImagePull(ctx, img.Registry, imagetypes.PullOptions{})
	if err != nil {
		_ = s.UpdateStatus(ctx, id, models.ImageStatusFailed)
		return err
	}
	defer rc.Close()
	_, _ = io.Copy(io.Discard, rc)

	// 校验是否已在本地
	_, err = cli.ImageInspect(ctx, img.Registry)
	if err != nil {
		_ = s.UpdateStatus(ctx, id, models.ImageStatusFailed)
		return err
	}

	return s.UpdateStatus(ctx, id, models.ImageStatusReady)
}

// Verify 校验镜像是否存在本地
func (s *ImageService) Verify(ctx context.Context, id string) (bool, error) {
	img, exists, err := s.ImageRepo.FindByIdExists(ctx, id)
	if err != nil {
		return false, err
	}
	if !exists {
		return false, xe.ErrImageNotFound
	}
	cli := s.DockerClient()
	_, err = cli.ImageInspect(ctx, img.Registry)
	if err != nil {
		_ = s.UpdateStatus(ctx, id, models.ImageStatusMissing)
		return false, nil
	}
	_ = s.UpdateStatus(ctx, id, models.ImageStatusReady)
	return true, nil
}

// RemoveLocal 从本地删除镜像
func (s *ImageService) RemoveLocal(ctx context.Context, id string) error {
	img, exists, err := s.ImageRepo.FindByIdExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return xe.ErrImageNotFound
	}

	_ = s.UpdateStatus(ctx, id, models.ImageStatusDeleting)

	cli := s.DockerClient()
	_, err = cli.ImageRemove(ctx, img.Registry, imagetypes.RemoveOptions{
		Force:         true,
		PruneChildren: true,
	})
	if err != nil {
		_ = s.UpdateStatus(ctx, id, models.ImageStatusMissing)
		return nil
	}
	return s.UpdateStatus(ctx, id, models.ImageStatusMissing)
}

// SyncAllStatuses 同步全部镜像的本地存在状态
func (s *ImageService) SyncAllStatuses(ctx context.Context) error {
	items, err := s.ImageRepo.FindAll(ctx)
	if err != nil {
		return err
	}
	cli := s.DockerClient()
	for _, it := range items {
		_, err := cli.ImageInspect(ctx, it.Registry)
		if err != nil {
			_ = s.UpdateStatus(ctx, it.ID, models.ImageStatusMissing)
			continue
		}
		_ = s.UpdateStatus(ctx, it.ID, models.ImageStatusReady)
	}
	return nil
}

// PullAll 异步拉取全部镜像（串行执行）
func (s *ImageService) PullAll(ctx context.Context) error {
	items, err := s.ImageRepo.FindAll(ctx)
	if err != nil {
		return err
	}
	go func() {
		background := context.Background()
		for _, it := range items {
			// 忽略单个错误，继续其他镜像
			_ = s.Pull(background, it.ID)
		}
	}()
	return nil
}
