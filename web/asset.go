package web

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var dist embed.FS

func Assets() fs.FS {
	sub, _ := fs.Sub(dist, "dist")
	return sub
}
