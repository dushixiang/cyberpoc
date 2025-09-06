package config

type Config struct {
	Gateway Gateway     `yaml:"gateway"`
	Email   EmailConfig `yaml:"email"`
}

type Docker struct {
}

type Gateway struct {
	Enabled bool   `yaml:"enabled"` // 启用网关
	Addr    string `yaml:"addr"`    // 网关地址

	Domain string `yaml:"domain"` // 只用于展示
	Https  bool   `yaml:"https"`  // 只用于展示,是否启用HTTPS
}

type EmailConfig struct {
	Host     string `json:"host,omitempty"`
	Port     string `json:"port,omitempty"`
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
	SSL      bool   `json:"ssl,omitempty"`
}
