package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type ProductRepository interface {
	GetByID(id uint) (*models.Product, error)
	GetByCode(code string) (*models.Product, error)
	GetAll() ([]models.Product, error)
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(id uint) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) GetByID(id uint) (*models.Product, error) {
	var product models.Product
	if err := r.db.First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) GetByCode(code string) (*models.Product, error) {
	var product models.Product
	if err := r.db.Where("code = ?", code).First(&product).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) GetAll() ([]models.Product, error) {
	var products []models.Product
	if err := r.db.Order("code asc").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}
