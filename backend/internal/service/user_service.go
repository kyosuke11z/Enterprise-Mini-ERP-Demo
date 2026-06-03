package service

import (
	"backend/internal/models"
	"backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	GetByID(id uint) (*models.User, error)
	GetAll() ([]models.User, error)
	Create(user *models.User, rawPassword string) error
	Update(user *models.User, rawPassword string) error
	Delete(id uint) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetByID(id uint) (*models.User, error) {
	return s.userRepo.GetByID(id)
}

func (s *userService) GetAll() ([]models.User, error) {
	return s.userRepo.GetAll()
}

func (s *userService) Create(user *models.User, rawPassword string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hash)
	return s.userRepo.Create(user)
}

func (s *userService) Update(user *models.User, rawPassword string) error {
	// If a new password is provided, hash it
	if rawPassword != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hash)
	} else {
		// Retain existing password if blank (fetch it first)
		existing, err := s.userRepo.GetByID(user.ID)
		if err == nil {
			user.Password = existing.Password
		}
	}
	return s.userRepo.Update(user)
}

func (s *userService) Delete(id uint) error {
	return s.userRepo.Delete(id)
}
