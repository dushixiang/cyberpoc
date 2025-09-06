package models

import (
	"github.com/mileusna/useragent"
	"gorm.io/datatypes"
)

type LoginLog struct {
	ID           string                                  `gorm:"primary_key" json:"id"`
	Account      string                                  `json:"account"`
	IP           string                                  `json:"ip"`
	LoginAt      int64                                   `json:"login_at"`
	Success      bool                                    `json:"success"`
	Reason       string                                  `json:"reason"`
	Region       string                                  `json:"region"`
	UserAgentRaw string                                  `json:"-"`
	UserAgent    datatypes.JSONType[useragent.UserAgent] `json:"user_agent"`
}

func (r *LoginLog) TableName() string {
	return "login_logs"
}
