package service

import (
	"errors"
	"testing"

	"backend/internal/models"

	"golang.org/x/crypto/bcrypt"
)

// MockUserRepository implements repository.UserRepository
type MockUserRepository struct {
	users map[string]*models.User
}

func (m *MockUserRepository) GetByUsername(username string) (*models.User, error) {
	user, exists := m.users[username]
	if !exists {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (m *MockUserRepository) GetByID(id uint) (*models.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (m *MockUserRepository) GetAll() ([]models.User, error) {
	var list []models.User
	for _, u := range m.users {
		list = append(list, *u)
	}
	return list, nil
}

func (m *MockUserRepository) Create(user *models.User) error {
	m.users[user.Username] = user
	return nil
}

func (m *MockUserRepository) Update(user *models.User) error {
	m.users[user.Username] = user
	return nil
}

func (m *MockUserRepository) Delete(id uint) error {
	return nil
}

func TestAuthService_Login(t *testing.T) {
	// Setup hashed password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	jwtSecret := "test_secret_key"

	mockRepo := &MockUserRepository{
		users: map[string]*models.User{
			"admin": {
				ID:       1,
				Username: "admin",
				Password: string(hashedPassword),
				Name:     "Test Admin",
				Role:     models.RoleAdmin,
				IsActive: true,
			},
			"disabled": {
				ID:       2,
				Username: "disabled",
				Password: string(hashedPassword),
				Name:     "Disabled User",
				Role:     models.RoleStaff,
				IsActive: false,
			},
		},
	}

	authService := NewAuthService(mockRepo, jwtSecret)

	// Test Case 1: Valid Login
	t.Run("Valid Login", func(t *testing.T) {
		token, user, err := authService.Login("admin", "password123")
		if err != nil {
			t.Fatalf("Expected login to succeed, got error: %v", err)
		}
		if token == "" {
			t.Fatal("Expected non-empty token")
		}
		if user.Username != "admin" {
			t.Errorf("Expected user username to be 'admin', got: %s", user.Username)
		}
	})

	// Test Case 2: Invalid Password
	t.Run("Invalid Password", func(t *testing.T) {
		_, _, err := authService.Login("admin", "wrongpassword")
		if err == nil {
			t.Fatal("Expected error for invalid password, got nil")
		}
		if err.Error() != "invalid credentials" {
			t.Errorf("Expected error message 'invalid credentials', got: %s", err.Error())
		}
	})

	// Test Case 3: Non-existent User
	t.Run("Non-existent User", func(t *testing.T) {
		_, _, err := authService.Login("unknown", "password123")
		if err == nil {
			t.Fatal("Expected error for non-existent user, got nil")
		}
		if err.Error() != "invalid credentials" {
			t.Errorf("Expected error message 'invalid credentials', got: %s", err.Error())
		}
	})

	// Test Case 4: Disabled Account
	t.Run("Disabled User Login", func(t *testing.T) {
		_, _, err := authService.Login("disabled", "password123")
		if err == nil {
			t.Fatal("Expected error for deactivated user, got nil")
		}
		if err.Error() != "user account is inactive" {
			t.Errorf("Expected error message 'user account is inactive', got: %s", err.Error())
		}
	})
}
