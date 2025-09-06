package tools

import (
	"image"

	"github.com/MuhammadSaim/goavatar"
)

func MakeAvatar(input string) (img image.Image) {
	img = goavatar.Make(input,
		goavatar.WithSize(64),
	)
	return
}

func MakeBase64Avatar(input string) string {
	img := MakeAvatar(input)
	base64, err := ImageToBase64(img)
	if err != nil {
		return ""
	}
	return base64
}
