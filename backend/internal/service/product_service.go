package service

import (
	"backend/internal/models"
	"backend/internal/repository"
)

type ProductService interface {
	GetByID(id uint) (*models.Product, error)
	GetAll() ([]models.Product, error)
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(id uint) error
}

type productService struct {
	productRepo repository.ProductRepository
}

func NewProductService(productRepo repository.ProductRepository) ProductService {
	return &productService{
		productRepo: productRepo,
	}
}

func (s *productService) GetByID(id uint) (*models.Product, error) {
	return s.productRepo.GetByID(id)
}

func (s *productService) GetAll() ([]models.Product, error) {
	return s.productRepo.GetAll()
}

func (s *productService) Create(product *models.Product) error {
	return s.productRepo.Create(product)
}

func (s *productService) Update(product *models.Product) error {
	return s.productRepo.Update(product)
}

func (s *productService) Delete(id uint) error {
	return s.productRepo.Delete(id)
}
