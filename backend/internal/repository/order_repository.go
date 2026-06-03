package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	Create(order *models.Order) error
	GetByID(id uint) (*models.Order, error)
	GetAll() ([]models.Order, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *orderRepository) GetByID(id uint) (*models.Order, error) {
	var order models.Order
	if err := r.db.Preload("Items.Product").Preload("CreatedBy").First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) GetAll() ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Preload("Items.Product").Preload("CreatedBy").Order("created_at desc").Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}
