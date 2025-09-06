package main

import (
	"fmt"
	"os"

	"github.com/dushixiang/cyberpoc/internal"
	"github.com/dushixiang/cyberpoc/internal/cli"
	"github.com/spf13/cobra"
)

var (
	configFile string
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "cyberpoc",
		Short: "cyberpoc",
		Long:  ``,
	}

	// 全局配置文件标志
	rootCmd.PersistentFlags().StringVarP(&configFile, "config", "c", "config.yaml", "配置文件路径")

	// 服务器启动命令
	serveCmd := &cobra.Command{
		Use:   "serve",
		Short: "",
		Long:  ``,
		RunE: func(cmd *cobra.Command, args []string) error {
			return internal.Run(configFile)
		},
	}

	// 用户管理命令
	userCmd := cli.NewUserCommand(configFile)

	// 初始化命令
	initCmd := cli.NewInitCommand(configFile)

	// 添加子命令
	rootCmd.AddCommand(serveCmd)
	rootCmd.AddCommand(userCmd)
	rootCmd.AddCommand(initCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "错误: %v\n", err)
		os.Exit(1)
	}
}
