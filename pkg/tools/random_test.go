package tools

import "testing"

func TestGenerateRandomID(t *testing.T) {
	for i := 0; i < 10; i++ {
		randomID := DefaultRandomId()
		t.Log(randomID)
	}
}

func TestRandomID(t *testing.T) {
	for i := 0; i < 48; i++ {
		randomId := RandomId(i + 1)
		t.Log(randomId)
	}
}
