package cli

import (
	"context"
	"fmt"
	"os"
	"strings"
	"syscall"
	"text/tabwriter"

	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/dushixiang/cyberpoc/internal/identity/views"
	"github.com/dushixiang/cyberpoc/pkg/tools"
	"github.com/spf13/cobra"
	"golang.org/x/term"
)

// NewUserCommand 创建用户管理命令
func NewUserCommand(configFile string) *cobra.Command {
	userCmd := &cobra.Command{
		Use:   "user",
		Short: "用户管理",
		Long:  `用户管理功能：创建、更新、删除用户，修改密码等`,
	}

	// 添加子命令
	userCmd.AddCommand(
		newUserCreateCommand(configFile),
		newUserListCommand(configFile),
		newUserUpdateCommand(configFile),
		newUserDeleteCommand(configFile),
		newUserChangePasswordCommand(configFile),
	)

	return userCmd
}

// newUserCreateCommand 创建用户
func newUserCreateCommand(configFile string) *cobra.Command {
	var (
		name     string
		account  string
		password string
		userType string
	)

	cmd := &cobra.Command{
		Use:   "create",
		Short: "创建新用户",
		Long:  `创建新用户账号`,
		RunE: func(cmd *cobra.Command, args []string) error {
			container, err := initializeDependency(configFile)
			if err != nil {
				return fmt.Errorf("初始化容器失败: %v", err)
			}

			// 如果密码为空，提示输入
			if password == "" {
				fmt.Print("请输入密码: ")
				passwordBytes, err := term.ReadPassword(syscall.Stdin)
				if err != nil {
					return fmt.Errorf("读取密码失败: %v", err)
				}
				password = string(passwordBytes)
				fmt.Println() // 换行
			}

			// 验证用户类型
			var userTypeEnum models.UserType
			switch strings.ToLower(userType) {
			case "admin":
				userTypeEnum = models.AdminUser
			case "regular":
				userTypeEnum = models.RegularUser
			default:
				return fmt.Errorf("无效的用户类型: %s，支持 admin 或 regular", userType)
			}

			base64Encoding := tools.MakeBase64Avatar(account)
			req := views.UserCreateRequest{
				ID:       "",
				Name:     name,
				Account:  account,
				Password: password,
				Type:     userTypeEnum,
				Avatar:   base64Encoding,
			}

			ctx := context.Background()
			if err := container.UserService.Create(ctx, req); err != nil {
				return fmt.Errorf("创建用户失败: %v", err)
			}

			fmt.Printf("用户 %s (%s) 创建成功\n", name, account)
			return nil
		},
	}

	cmd.Flags().StringVarP(&name, "name", "n", "", "用户名称 (必需)")
	cmd.Flags().StringVarP(&account, "account", "a", "", "用户账号/邮箱 (必需)")
	cmd.Flags().StringVarP(&password, "password", "p", "", "用户密码 (可选，不提供将提示输入)")
	cmd.Flags().StringVarP(&userType, "type", "t", "regular", "用户类型 (admin/regular)")

	cmd.MarkFlagRequired("name")
	cmd.MarkFlagRequired("account")

	return cmd
}

// newUserListCommand 列出用户
func newUserListCommand(configFile string) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "list",
		Short: "列出所有用户",
		Long:  `显示系统中的所有用户列表`,
		RunE: func(cmd *cobra.Command, args []string) error {
			container, err := initializeDependency(configFile)
			if err != nil {
				return fmt.Errorf("初始化容器失败: %v", err)
			}

			ctx := context.Background()

			// 直接使用 Repository 的 FindAll 方法
			db := container.UserService.GetDB(ctx)
			var users []models.User
			err = db.Find(&users).Error
			if err != nil {
				return fmt.Errorf("获取用户列表失败: %v", err)
			}

			if len(users) == 0 {
				fmt.Println("没有找到任何用户")
				return nil
			}

			// 使用表格格式输出
			w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', tabwriter.TabIndent)
			fmt.Fprintln(w, "ID\t用户名\t账号\t类型\t状态\t创建时间")
			fmt.Fprintln(w, "----\t----\t----\t----\t----\t----")

			for _, user := range users {
				status := "启用"
				if !user.Enabled {
					status = "禁用"
				}
				createdAt := formatTimestamp(user.CreatedAt)
				fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\t%s\n",
					user.ID, user.Name, user.Account, user.Type, status, createdAt)
			}

			w.Flush()
			return nil
		},
	}

	return cmd
}

// newUserUpdateCommand 更新用户信息
func newUserUpdateCommand(configFile string) *cobra.Command {
	var (
		userID   string
		name     string
		account  string
		userType string
		enabled  string
	)

	cmd := &cobra.Command{
		Use:   "update",
		Short: "更新用户信息",
		Long:  `更新用户的基本信息（不包括密码）`,
		RunE: func(cmd *cobra.Command, args []string) error {
			container, err := initializeDependency(configFile)
			if err != nil {
				return fmt.Errorf("初始化容器失败: %v", err)
			}

			ctx := context.Background()

			// 获取当前用户信息
			user, err := container.UserService.FindById(ctx, userID)
			if err != nil {
				return fmt.Errorf("用户不存在: %v", err)
			}

			// 更新字段（只更新提供的字段）
			if name != "" {
				user.Name = name
			}
			if account != "" {
				user.Account = account
			}
			if userType != "" {
				switch strings.ToLower(userType) {
				case "admin":
					user.Type = models.AdminUser
				case "regular":
					user.Type = models.RegularUser
				default:
					return fmt.Errorf("无效的用户类型: %s，支持 admin 或 regular", userType)
				}
			}
			if enabled != "" {
				switch strings.ToLower(enabled) {
				case "true", "1", "yes", "on":
					user.Enabled = true
				case "false", "0", "no", "off":
					user.Enabled = false
				default:
					return fmt.Errorf("无效的状态值: %s，支持 true/false", enabled)
				}
			}

			if err := container.UserService.UpdateById(ctx, user); err != nil {
				return fmt.Errorf("更新用户失败: %v", err)
			}

			fmt.Printf("用户 %s 更新成功\n", user.Name)
			return nil
		},
	}

	cmd.Flags().StringVarP(&userID, "id", "i", "", "用户ID (必需)")
	cmd.Flags().StringVarP(&name, "name", "n", "", "新的用户名称")
	cmd.Flags().StringVarP(&account, "account", "a", "", "新的用户账号/邮箱")
	cmd.Flags().StringVarP(&userType, "type", "t", "", "新的用户类型 (admin/regular)")
	cmd.Flags().StringVarP(&enabled, "enabled", "e", "", "用户状态 (true/false)")

	cmd.MarkFlagRequired("id")

	return cmd
}

// newUserDeleteCommand 删除用户
func newUserDeleteCommand(configFile string) *cobra.Command {
	var (
		userID string
		force  bool
	)

	cmd := &cobra.Command{
		Use:   "delete",
		Short: "删除用户",
		Long:  `删除指定用户账号`,
		RunE: func(cmd *cobra.Command, args []string) error {
			container, err := initializeDependency(configFile)
			if err != nil {
				return fmt.Errorf("初始化容器失败: %v", err)
			}

			ctx := context.Background()

			// 获取用户信息
			user, err := container.UserService.FindById(ctx, userID)
			if err != nil {
				return fmt.Errorf("用户不存在: %v", err)
			}

			// 确认删除
			if !force {
				fmt.Printf("确定要删除用户 %s (%s) 吗？[y/N]: ", user.Name, user.Account)
				var confirm string
				fmt.Scanln(&confirm)
				if strings.ToLower(confirm) != "y" && strings.ToLower(confirm) != "yes" {
					fmt.Println("操作已取消")
					return nil
				}
			}

			if err := container.UserService.DeleteById(ctx, userID); err != nil {
				return fmt.Errorf("删除用户失败: %v", err)
			}

			fmt.Printf("用户 %s 删除成功\n", user.Name)
			return nil
		},
	}

	cmd.Flags().StringVarP(&userID, "id", "i", "", "用户ID (必需)")
	cmd.Flags().BoolVarP(&force, "force", "f", false, "强制删除，不提示确认")

	cmd.MarkFlagRequired("id")

	return cmd
}

// newUserChangePasswordCommand 修改密码
func newUserChangePasswordCommand(configFile string) *cobra.Command {
	var (
		userID      string
		newPassword string
	)

	cmd := &cobra.Command{
		Use:   "change-password",
		Short: "修改用户密码",
		Long:  `修改指定用户的密码`,
		RunE: func(cmd *cobra.Command, args []string) error {
			container, err := initializeDependency(configFile)
			if err != nil {
				return fmt.Errorf("初始化容器失败: %v", err)
			}

			ctx := context.Background()

			// 验证用户存在
			user, err := container.UserService.FindById(ctx, userID)
			if err != nil {
				return fmt.Errorf("用户不存在: %v", err)
			}

			// 如果密码为空，提示输入
			if newPassword == "" {
				fmt.Print("请输入新密码: ")
				passwordBytes, err := term.ReadPassword(int(syscall.Stdin))
				if err != nil {
					return fmt.Errorf("读取密码失败: %v", err)
				}
				newPassword = string(passwordBytes)
				fmt.Println() // 换行

				fmt.Print("请再次输入新密码: ")
				confirmBytes, err := term.ReadPassword(int(syscall.Stdin))
				if err != nil {
					return fmt.Errorf("读取密码失败: %v", err)
				}
				confirm := string(confirmBytes)
				fmt.Println() // 换行

				if newPassword != confirm {
					return fmt.Errorf("两次输入的密码不一致")
				}
			}

			_, err = container.UserService.ChangePassword(ctx, userID, newPassword)
			if err != nil {
				return fmt.Errorf("修改密码失败: %v", err)
			}

			fmt.Printf("用户 %s 的密码修改成功\n", user.Name)
			return nil
		},
	}

	cmd.Flags().StringVarP(&userID, "id", "i", "", "用户ID (必需)")
	cmd.Flags().StringVarP(&newPassword, "password", "p", "", "新密码 (可选，不提供将提示输入)")

	cmd.MarkFlagRequired("id")

	return cmd
}
