package types

import (
	"github.com/dushixiang/cyberpoc/internal/config"
	"github.com/go-orz/orz"
)

type SubApp interface {
	Configure(app *orz.App, conf *config.Config) error
}
