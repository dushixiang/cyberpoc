package nostd

import (
	"github.com/oklog/ulid/v2"
	"testing"
)

func TestULID(t *testing.T) {
	id := ulid.Make().String()
	t.Log(id)
}
