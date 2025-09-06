package cli

import (
	"fmt"
	"time"

	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/dushixiang/cyberpoc/internal/cyber"
	"github.com/dushixiang/cyberpoc/internal/identity"
	"github.com/go-orz/orz"
)

// initializeDependency 初始化容器和服务
func initializeDependency(configFile string) (*identity.Dependency, error) {
	// 使用 orz 框架初始化组件
	framework, err := orz.NewFramework(
		orz.WithConfig(configFile),
		orz.WithLoggerFromConfig(),
		orz.WithDatabase(),
	)
	if err != nil {
		return nil, fmt.Errorf("初始化框架失败: %v", err)
	}

	// 获取日志器
	logger := framework.App().Logger()

	// 获取数据库
	db := framework.App().GetDatabase()

	dependency := identity.ProviderDependency(logger, db, &config.Config{})
	return dependency, nil
}

// initializeCyberDependency 初始化cyber模块的容器和服务
func initializeCyberDependency(configFile string) (*cyber.Dependency, error) {
	// 使用 orz 框架初始化组件
	framework, err := orz.NewFramework(
		orz.WithConfig(configFile),
		orz.WithLoggerFromConfig(),
		orz.WithDatabase(),
	)
	if err != nil {
		return nil, fmt.Errorf("初始化框架失败: %v", err)
	}

	// 获取日志器
	logger := framework.App().Logger()

	// 获取数据库
	db := framework.App().GetDatabase()

	// 获取配置
	var conf config.Config
	err = framework.App().GetConfig().App.Unmarshal(&conf)
	if err != nil {
		return nil, fmt.Errorf("获取配置失败: %v", err)
	}

	dependency := cyber.ProviderDependency(logger, db, &conf)
	return dependency, nil
}

// formatTimestamp 格式化时间戳
func formatTimestamp(timestamp int64) string {
	if timestamp == 0 {
		return "N/A"
	}
	return time.UnixMilli(timestamp).Format("2006-01-02 15:04:05")
}
