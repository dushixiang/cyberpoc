package tools

import (
	"bytes"
	"crypto/rand"
)

const (
	base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
	onlyChar       = "ABCDEFGHJKLMNPQRSTUVWXYZ"
	onlyNum        = "0123456789"
	idLength       = 32
)

// randomString generates a random string of given length using the provided alphabet.
// It returns an empty string if secure randomness cannot be read.
func randomString(length int, alphabet string) string {
	if length <= 0 {
		return ""
	}
	p := make([]byte, length)
	if _, err := rand.Read(p); err != nil {
		return ""
	}
	for i, b := range p {
		p[i] = alphabet[int(b)%len(alphabet)]
	}
	return string(p)
}

func DefaultRandomId() string {
	return RandomId(idLength)
}

func RandomId(length int) string {
	s := randomString(length, base58Alphabet)
	if s == "" {
		return ""
	}
	b := []byte(s)
	b[0] = bytes.ToUpper([]byte{b[0]})[0]
	return string(b)
}

func RandomChar(n int) string {
	return randomString(n, onlyChar)
}

func RandomNumber(n int) string {
	return randomString(n, onlyNum)
}
