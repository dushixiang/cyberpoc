package service

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/smtp"

	"github.com/dushixiang/cyberpoc/internal/config"
	"go.uber.org/zap"

	"github.com/jordan-wright/email"
)

func NewMailService(logger *zap.Logger, config *config.Config) *MailService {
	return &MailService{
		logger: logger,
		config: config,
	}
}

type MailService struct {
	logger *zap.Logger
	config *config.Config
}

func (s MailService) SendMail(ctx context.Context, name, to, subject, text string) error {
	mailSender := s.config.Email
	e := email.NewEmail()

	e.From = fmt.Sprintf("%s <%s>", name, mailSender.Username)
	e.To = []string{to}
	e.Subject = subject
	e.Text = []byte(text)

	auth := smtp.PlainAuth("", mailSender.Username, mailSender.Password, mailSender.Host)
	hostPort := net.JoinHostPort(mailSender.Host, mailSender.Port)

	s.logger.Sugar().Debugf("send mail to: %v, subject: %v, hostPort: %s, ssl: %v", to, subject, hostPort, mailSender.SSL)
	if mailSender.SSL {
		return e.SendWithTLS(hostPort, auth, &tls.Config{ServerName: mailSender.Host})
	}
	return e.Send(hostPort, auth)
}
