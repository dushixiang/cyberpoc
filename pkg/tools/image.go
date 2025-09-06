package tools

import (
	"bytes"
	"encoding/base64"
	"image"
	"image/png"
	"io"
	"net/http"
)

func imageToBase64(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func ImageToBase64(img image.Image) (base64Encoding string, err error) {
	emptyBuff := bytes.NewBuffer(nil)
	err = png.Encode(emptyBuff, img)
	if err != nil {
		return "", nil
	}

	imgBytes := emptyBuff.Bytes()[0:emptyBuff.Len()]
	base64Encoding = "data:image/png;base64," + imageToBase64(imgBytes)
	return base64Encoding, nil
}

func RemoteImageToBase64(imgUrl string) (base64Encoding string, err error) {
	resp, err := http.Get(imgUrl)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	_bytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	mimeType := http.DetectContentType(_bytes)

	switch mimeType {
	case "image/jpeg":
		base64Encoding += "data:image/jpeg;base64,"
	case "image/png":
		base64Encoding += "data:image/png;base64,"
	}

	base64Encoding += imageToBase64(_bytes)
	return base64Encoding, nil
}

func IsBase64ImageAndSizeLessThan(base64Encoding string, maxSize int) bool {
	if base64Encoding == `` {
		return false
	}
	imgBytes, err := base64.StdEncoding.DecodeString(base64Encoding)
	if err != nil {
		return false
	}

	if len(imgBytes) > maxSize {
		return false
	}

	img, _, err := image.Decode(bytes.NewBuffer(imgBytes))
	if err != nil {
		return false
	}
	if img == nil {
		return false
	}
	return true
}
