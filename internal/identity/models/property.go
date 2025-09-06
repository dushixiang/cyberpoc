package models

type Property struct {
	ID    string
	Value string
}

func (p *Property) TableName() string {
	return "properties"
}

const (
	PropertyKeyMaxChallengeCount = "max_challenge_count"
	PropertyKeySystemName        = "system_name"
)

type SystemConfig struct {
	MaxChallengeCount int
	Name              string
}
