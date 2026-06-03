package service

import (
	"errors"

	"backend/internal/auth"
	"backend/internal/models"
	"backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(username, password string) (string, *models.User, error)
	GetUserByID(id uint) (*models.User, error)
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *authService) Login(username, password string) (string, *models.User, error) {
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	if !user.IsActive {
		return "", nil, errors.New("user account is inactive")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	token, err := auth.GenerateToken(user.ID, user.Username, string(user.Role), s.jwtSecret)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *authService) GetUserByID(id uint) (*models.User, error) {
	return s.userRepo.GetByID(id)
}
