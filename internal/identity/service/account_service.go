package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/dushixiang/cyberpoc/internal/identity/models"
	"github.com/dushixiang/cyberpoc/internal/identity/repo"
	"github.com/dushixiang/cyberpoc/internal/identity/views"
	"github.com/dushixiang/cyberpoc/pkg/nostd"
	"github.com/dushixiang/cyberpoc/pkg/tools"
	"github.com/dushixiang/cyberpoc/pkg/xe"

	"github.com/go-orz/cache"
	"github.com/go-orz/captcha"
	"github.com/go-orz/orz"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

const (
	TokenExpireIn = time.Hour * 24 * 7
)

func NewAccountService(logger *zap.Logger, db *gorm.DB, userService *UserService, mailService *MailService, propertyService *PropertyService) *AccountService {
	service := AccountService{
		logger:          logger,
		Service:         orz.NewService(db),
		AccessTokenRepo: repo.NewSessionRepo(db),
		LoginLogRepo:    repo.NewLoginLogRepo(db),
		otp:             cache.New[string, string](time.Minute),
		accessTokens:    nil,

		mailLimiter:     cache.New[string, string](time.Minute),
		codeManager:     cache.New[string, string](time.Minute),
		captcha:         cache.New[string, string](time.Minute),
		resetManager:    cache.New[string, string](time.Minute),
		userService:     userService,
		mailService:     mailService,
		propertyService: propertyService,
	}
	service.accessTokens = cache.New[string, models.AccessToken](time.Minute, cache.Option[string, models.AccessToken]{
		OnEvicted: service.onEvicted,
	})
	return &service
}

type AccountService struct {
	logger *zap.Logger
	*orz.Service
	AccessTokenRepo *repo.AccessTokenRepo
	LoginLogRepo    *repo.LoginLogRepo

	otp          cache.Cache[string, string]
	accessTokens cache.Cache[string, models.AccessToken]

	captcha      cache.Cache[string, string]
	mailLimiter  cache.Cache[string, string]
	codeManager  cache.Cache[string, string]
	resetManager cache.Cache[string, string]

	userService     *UserService
	mailService     *MailService
	propertyService *PropertyService
}

func (s *AccountService) GetCaptcha() (string, string, error) {
	_captcha, err := captcha.New()
	if err != nil {
		return "", "", err
	}
	img, word := _captcha.Create()
	base64Encoding, err := captcha.ToBase64(img)
	if err != nil {
		return "", "", nil
	}

	key := uuid.NewString()
	s.captcha.Set(key, word, time.Minute*5)
	return key, base64Encoding, nil
}

func (s *AccountService) Login(ctx context.Context, account views.LoginAccount, verifyCaptcha bool) (token *models.AccessToken, err error) {
	defer func() {
		// 存储登录日志
		loginLog := models.LoginLog{
			ID:           uuid.NewString(),
			Account:      account.Account,
			IP:           account.IP,
			UserAgentRaw: account.UserAgent,
			LoginAt:      time.Now().UnixMilli(),
			Success:      true,
			Reason:       "",
			Region:       "",
			UserAgent:    datatypes.NewJSONType(account.ParseUserAgent()),
		}
		if err != nil {
			loginLog.Success = false
			loginLog.Reason = err.Error()
		}
		_ = s.LoginLogRepo.Create(ctx, &loginLog)
	}()

	if verifyCaptcha {
		val, ok := s.captcha.Get(account.Key)
		if !ok {
			return nil, xe.ErrCaptchaIncorrect
		}
		// 只验证一次
		s.captcha.Delete(account.Key)
		// 忽略大小写
		if !strings.EqualFold(val, account.Captcha) {
			return nil, xe.ErrCaptchaIncorrect
		}
	}

	user, err := s.userService.FindByAccount(ctx, account.Account)
	if err != nil {
		return nil, xe.ErrAccountIncorrect
	}
	if nostd.BcryptMatch([]byte(user.Password), []byte(account.Password)) != nil {
		return nil, xe.ErrAccountIncorrect
	}

	if !user.Enabled {
		return nil, xe.ErrAccountDisabled
	}

	return s.loginSuccess(ctx, user)
}

func (s *AccountService) loginSuccess(ctx context.Context, user models.User) (*models.AccessToken, error) {
	token := uuid.NewString()
	accessToken := models.AccessToken{
		ID:        token,
		UserId:    user.ID,
		UserType:  user.Type,
		CreatedAt: time.Now().UnixMilli(),
	}
	s.accessTokens.Set(token, accessToken, TokenExpireIn)
	if err := s.AccessTokenRepo.Create(ctx, &accessToken); err != nil {
		return nil, err
	}
	return &accessToken, nil
}

func (s *AccountService) Logout(ctx context.Context, token string) error {
	s.accessTokens.Delete(token)
	return nil
}

func (s *AccountService) AccountId(token string) (string, bool) {
	session, ok := s.accessTokens.Get(token)
	if ok {
		s.accessTokens.Set(token, session, TokenExpireIn)
	}
	return session.UserId, ok
}

func (s *AccountService) IsAdmin(token string) bool {
	session, ok := s.accessTokens.Get(token)
	if ok {
		return session.IsAdmin()
	}
	return false
}

func (s *AccountService) DeleteByUserId(ctx context.Context, userId string) error {
	return s.Transaction(ctx, func(ctx context.Context) error {
		items, err := s.AccessTokenRepo.FindByUserId(ctx, userId)
		if err != nil {
			return err
		}
		var sessionIds = make([]string, 0, len(items))
		for _, item := range items {
			s.accessTokens.Delete(item.ID)
			sessionIds = append(sessionIds, item.ID)
		}

		return s.AccessTokenRepo.DeleteByIdIn(ctx, sessionIds)
	})
}

func (s *AccountService) onEvicted(token string, session models.AccessToken) {
	ctx := context.Background()
	err := s.AccessTokenRepo.DeleteById(ctx, token)
	if err != nil {
		s.logger.Sugar().Errorf(`delete session err: %v`, err)
	}
}

func (s *AccountService) Init(ctx context.Context) error {
	items, err := s.AccessTokenRepo.FindAll(ctx)
	if err != nil {
		return err
	}
	for _, item := range items {
		s.accessTokens.Set(item.ID, item, TokenExpireIn)
	}
	s.logger.Sugar().Infof("reload session count: %v", len(items))
	return nil
}

func (s *AccountService) Register(ctx context.Context, payload views.RegisterAccount) error {
	// 验证码校验
	val, ok := s.captcha.Get(payload.Key)
	if !ok {
		return xe.ErrFailedCaptcha
	}
	// 不允许重复使用验证码
	s.captcha.Delete(payload.Key)
	if !strings.EqualFold(val, payload.Captcha) {
		return xe.ErrFailedCaptcha
	}

	// 邮箱验证码校验
	val, ok = s.codeManager.Get(payload.Account)
	if !ok {
		return xe.ErrFailedCode
	}
	// 不允许重复使用邮箱验证码
	s.codeManager.Delete(payload.Account)
	if !strings.EqualFold(val, payload.Code) {
		return xe.ErrFailedCode
	}

	exists, err := s.userService.ExistsByAccount(ctx, payload.Account)
	if err != nil {
		return err
	}

	if exists {
		return xe.ErrAccountDuplicate
	}

	base64Encoding := tools.MakeBase64Avatar(payload.Account)

	user := views.UserCreateRequest{
		ID:       uuid.NewString(),
		Name:     payload.Name,
		Account:  payload.Account,
		Password: payload.Password,
		Avatar:   base64Encoding,
		Type:     models.RegularUser,
	}

	if err := s.userService.Create(ctx, user); err != nil {
		return err
	}
	return nil
}

func (s *AccountService) SendCode(ctx context.Context, ip string, d views.SendCode) error {
	_, ok := s.mailLimiter.Get(ip)
	if ok {
		return orz.NewError(400, "请等待60秒后重新发送")
	}
	s.mailLimiter.Set(ip, "", time.Minute)

	exists, err := s.userService.ExistsByAccount(ctx, d.Mail)
	if err != nil {
		return err
	}
	if exists {
		return xe.ErrAccountAlreadyUsed
	}
	systemConfig, err := s.propertyService.GetSystemConfig(ctx)
	if err != nil {
		return err
	}

	randStr := tools.RandomNumber(6)
	// 设置验证码
	s.codeManager.Set(d.Mail, randStr, time.Minute*5)

	go func() {
		var tmpl = AccountRegisterCodeTemplate{
			SystemName:   systemConfig.Name,
			Code:         randStr,
			IP:           ip,
			GenerateTime: time.Now().Format(time.DateTime),
		}
		text, _ := tmpl.Format()
		err = s.mailService.SendMail(context.Background(), systemConfig.Name, d.Mail, fmt.Sprintf("%s 注册验证码", systemConfig.Name), text)
		if err != nil {

		}
	}()
	return nil
}

func (s *AccountService) ForgotPassword(ctx context.Context, item views.ForgotPasswordRequest) error {
	captchaValue, ok := s.captcha.Get(item.CaptchaKey)
	if !ok {
		return xe.ErrCaptchaIncorrect
	}
	s.captcha.Delete(item.CaptchaKey)
	if !strings.EqualFold(captchaValue, item.Captcha) {
		return xe.ErrCaptchaIncorrect
	}

	exists, err := s.userService.ExistsByAccount(ctx, item.Account)
	if err != nil {
		return err
	}
	if !exists {
		return xe.ErrAccountNotFound
	}
	user, err := s.userService.FindByAccount(ctx, item.Account)
	if err != nil {
		return err
	}
	systemConfig, err := s.propertyService.GetSystemConfig(ctx)
	if err != nil {
		return err
	}

	var tmpl = AccountResetPasswordTemplate{
		Token:        uuid.NewString(),
		SystemName:   systemConfig.Name,
		UserName:     user.Name,
		IP:           item.IP,
		UserAgent:    item.UserAgent,
		GenerateTime: time.Now().Format(time.DateTime),
	}
	content, err := tmpl.BeforeFormat()
	if err != nil {
		return err
	}

	err = s.mailService.SendMail(ctx, systemConfig.Name, user.Account, fmt.Sprintf(`%s 重置密码`, systemConfig.Name), content)
	if err != nil {
		return fmt.Errorf("mail sending failed: %w", err)
	}

	s.resetManager.Set(tmpl.Token, user.ID, time.Minute*10)
	return nil
}

func (s *AccountService) ResetPassword(ctx context.Context, item views.ResetPasswordRequest) error {
	captchaValue, ok := s.captcha.Get(item.CaptchaKey)
	if !ok {
		return xe.ErrCaptchaIncorrect
	}
	s.captcha.Delete(item.CaptchaKey)
	if !strings.EqualFold(captchaValue, item.Captcha) {
		return xe.ErrCaptchaIncorrect
	}

	accountId, ok := s.resetManager.Get(item.Token)
	if !ok {
		return xe.ErrInvalidParams
	}
	s.resetManager.Delete(accountId)

	user, err := s.userService.FindById(ctx, accountId)
	if err != nil {
		return err
	}
	_, err = s.userService.ChangePassword(ctx, accountId, item.Password)
	if err != nil {
		return err
	}

	systemConfig, err := s.propertyService.GetSystemConfig(ctx)
	if err != nil {
		return err
	}

	var tmpl = AccountResetPasswordTemplate{
		SystemName:   systemConfig.Name,
		UserName:     user.Name,
		IP:           item.IP,
		UserAgent:    item.UserAgent,
		GenerateTime: time.Now().Format(time.DateTime),
	}
	content, err := tmpl.AfterFormat()
	if err != nil {
		return err
	}

	err = s.mailService.SendMail(ctx, systemConfig.Name, user.Account, fmt.Sprintf(`%s 重置密码成功`, systemConfig.Name), content)
	if err != nil {
		return fmt.Errorf("mail sending failed: %w", err)
	}
	return nil
}
