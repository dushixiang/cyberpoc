package nostd

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
)

const Token = "Cyber-Token"

func GetToken(c echo.Context) string {
	token := c.Request().Header.Get(Token)
	if len(token) > 0 {
		return token
	}
	token = c.QueryParam(Token)
	if token != "" {
		return token
	}
	cookie, err := c.Cookie(Token)
	if err != nil {
		return ""
	}
	return cookie.Value
}

func SafePathJoin(baseDir, userInput string) (string, error) {
	cleanedPath := filepath.Clean(userInput)
	absBaseDir, err := filepath.Abs(baseDir)
	if err != nil {
		return "", err
	}

	absFilePath, err := filepath.Abs(filepath.Join(absBaseDir, cleanedPath))
	if err != nil {
		return "", err
	}

	if !strings.HasPrefix(absFilePath, absBaseDir) {
		return "", fmt.Errorf("invalid file path: %s", userInput)
	}
	return absFilePath, nil
}
