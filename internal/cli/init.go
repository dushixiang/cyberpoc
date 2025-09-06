package cli

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/dushixiang/cyberpoc/internal/cyber/models"
	"github.com/spf13/cobra"
)

// NewInitCommand 创建初始化命令
func NewInitCommand(configFile string) *cobra.Command {
	initCmd := &cobra.Command{
		Use:   "init",
		Short: "初始化系统数据",
		Long:  `从default文件夹导入初始镜像和题目数据`,
	}

	// 添加子命令
	initCmd.AddCommand(
		newInitAllCommand(configFile),
		newInitImagesCommand(configFile),
		newInitChallengesCommand(configFile),
	)

	return initCmd
}

// newInitAllCommand 初始化所有数据
func newInitAllCommand(configFile string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "all",
		Short: "初始化所有数据",
		Long:  `导入所有镜像和题目数据`,
		RunE: func(cmd *cobra.Command, args []string) error {
			fmt.Println("开始初始化系统数据...")

			// 初始化镜像数据
			if err := initImages(configFile); err != nil {
				return fmt.Errorf("初始化镜像数据失败: %v", err)
			}

			// 初始化题目数据
			if err := initChallenges(configFile); err != nil {
				return fmt.Errorf("初始化题目数据失败: %v", err)
			}

			fmt.Println("系统数据初始化完成!")
			return nil
		},
	}

	return cmd
}

// newInitImagesCommand 初始化镜像数据
func newInitImagesCommand(configFile string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "images",
		Short: "初始化镜像数据",
		Long:  `从default/images.json导入镜像数据`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return initImages(configFile)
		},
	}

	return cmd
}

// newInitChallengesCommand 初始化题目数据
func newInitChallengesCommand(configFile string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "challenges",
		Short: "初始化题目数据",
		Long:  `从default/challenges.json导入题目数据`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return initChallenges(configFile)
		},
	}

	return cmd
}

// initImages 初始化镜像数据
func initImages(configFile string) error {
	fmt.Println("正在导入镜像数据...")

	container, err := initializeCyberDependency(configFile)
	if err != nil {
		return fmt.Errorf("初始化容器失败: %v", err)
	}

	// 读取镜像数据文件
	data, err := os.ReadFile("default/images.json")
	if err != nil {
		return fmt.Errorf("读取 default/images.json 失败: %v", err)
	}

	var images []models.Image
	if err := json.Unmarshal(data, &images); err != nil {
		return fmt.Errorf("解析镜像数据失败: %v", err)
	}

	ctx := context.Background()

	// 逐个创建镜像记录
	for _, image := range images {
		// 检查镜像是否已存在
		exists, err := container.ImageService.ExistsById(ctx, image.ID)
		if err != nil {
			fmt.Printf("检查镜像 %s 是否存在时出错: %v\n", image.Name, err)
			continue
		}

		if exists {
			fmt.Printf("镜像 %s 已存在，跳过\n", image.Name)
			continue
		}

		// 创建镜像记录
		if err := container.ImageService.Create(ctx, &image); err != nil {
			fmt.Printf("创建镜像 %s 失败: %v\n", image.Name, err)
			continue
		}

		fmt.Printf("成功导入镜像: %s\n", image.Name)
	}

	fmt.Printf("镜像数据导入完成，共处理 %d 个镜像\n", len(images))
	return nil
}

// initChallenges 初始化题目数据
func initChallenges(configFile string) error {
	fmt.Println("正在导入题目数据...")

	container, err := initializeCyberDependency(configFile)
	if err != nil {
		return fmt.Errorf("初始化容器失败: %v", err)
	}

	// 读取题目数据文件
	data, err := os.ReadFile("default/challenges.json")
	if err != nil {
		return fmt.Errorf("读取 default/challenges.json 失败: %v", err)
	}

	var challenges []models.Challenge
	if err := json.Unmarshal(data, &challenges); err != nil {
		return fmt.Errorf("解析题目数据失败: %v", err)
	}

	ctx := context.Background()

	// 逐个创建题目记录
	for _, challenge := range challenges {
		// 检查题目是否已存在
		exists, err := container.ChallengeService.ExistsById(ctx, challenge.ID)
		if err != nil {
			fmt.Printf("检查题目 %s 是否存在时出错: %v\n", challenge.Name, err)
			continue
		}

		if exists {
			fmt.Printf("题目 %s 已存在，跳过\n", challenge.Name)
			continue
		}

		// 创建题目记录
		if err := container.ChallengeService.Create(ctx, &challenge); err != nil {
			fmt.Printf("创建题目 %s 失败: %v\n", challenge.Name, err)
			continue
		}

		fmt.Printf("成功导入题目: %s\n", challenge.Name)
	}

	fmt.Printf("题目数据导入完成，共处理 %d 个题目\n", len(challenges))
	return nil
}
