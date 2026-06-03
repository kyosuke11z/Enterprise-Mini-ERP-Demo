package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestJWTTokenFlow(t *testing.T) {
	secret := "my_test_jwt_secret_key"
	userID := uint(42)
	username := "john_doe"
	role := "STAFF"

	// 1. Generate Token
	token, err := GenerateToken(userID, username, role, secret)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	if token == "" {
		t.Fatal("Expected token to be non-empty")
	}

	// 2. Parse Valid Token
	claims, err := ParseToken(token, secret)
	if err != nil {
		t.Fatalf("Failed to parse valid token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected UserID %d, got: %d", userID, claims.UserID)
	}
	if claims.Username != username {
		t.Errorf("Expected Username %s, got: %s", username, claims.Username)
	}
	if claims.Role != role {
		t.Errorf("Expected Role %s, got: %s", role, claims.Role)
	}

	// 3. Parse with Invalid Secret Key
	_, err = ParseToken(token, "wrong_secret_key")
	if err == nil {
		t.Fatal("Expected error when parsing with wrong secret, got nil")
	}

	// 4. Parse Expired Token
	expiredClaims := &JWTClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Expired 1 hour ago
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	expiredToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims).SignedString([]byte(secret))

	_, err = ParseToken(expiredToken, secret)
	if err == nil {
		t.Fatal("Expected error when parsing expired token, got nil")
	}
}
