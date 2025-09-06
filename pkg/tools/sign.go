package tools

import (
	"crypto/md5"
	"fmt"
	"sort"
	"strings"
)

// Md5Sign 排序+拼接+摘要
func Md5Sign(a ...string) string {
	sort.Strings(a)
	data := []byte(strings.Join(a, ""))
	has := md5.Sum(data)
	return fmt.Sprintf("%x", has)
}
