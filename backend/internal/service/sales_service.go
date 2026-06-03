package service

import (
	"errors"
	"fmt"
	"math"
	"time"

	"backend/internal/models"
	"backend/internal/repository"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CheckoutItemReq struct {
	ProductID uint    `json:"productId" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required,min=1"`
	Price     float64 `json:"price" binding:"required,min=0"`
}

type CheckoutReq struct {
	Items []CheckoutItemReq `json:"items" binding:"required,dive"`
}

type SalesService interface {
	Checkout(createdByID uint, req CheckoutReq) (*models.Order, error)
	GetAllOrders() ([]models.Order, error)
}

type salesService struct {
	db        *gorm.DB
	orderRepo repository.OrderRepository
}

func NewSalesService(db *gorm.DB, orderRepo repository.OrderRepository) SalesService {
	return &salesService{
		db:        db,
		orderRepo: orderRepo,
	}
}

func (s *salesService) Checkout(createdByID uint, req CheckoutReq) (*models.Order, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("cart is empty")
	}

	var subtotal float64
	var orderItems []models.OrderItem

	// Interactive ACID Transaction
	var order models.Order
	err := s.db.Transaction(func(tx *gorm.DB) error {
		for _, reqItem := range req.Items {
			var product models.Product

			// Row locking using GORM Locking Strength UPDATE (SELECT ... FOR UPDATE)
			// Prevents race conditions during simultaneous checkout requests
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, reqItem.ProductID).Error; err != nil {
				return fmt.Errorf("product with ID %d not found", reqItem.ProductID)
			}

			// Validate inventory level
			if product.Stock < reqItem.Quantity {
				return fmt.Errorf("insufficient stock for product %s. Available: %d, Requested: %d",
					product.Name, product.Stock, reqItem.Quantity)
			}

			// Deduct inventory
			newStock := product.Stock - reqItem.Quantity
			if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
				return fmt.Errorf("failed to update stock for product %s: %w", product.Name, err)
			}

			// Calculate values based on DB state to prevent client pricing overrides
			itemTotal := product.Price * float64(reqItem.Quantity)
			subtotal += itemTotal

			orderItems = append(orderItems, models.OrderItem{
				ProductID: product.ID,
				Quantity:  reqItem.Quantity,
				Price:     product.Price,
			})
		}

		// Calculate totals
		taxRate := 0.07
		tax := math.Round((subtotal*taxRate)*100) / 100
		total := subtotal + tax

		// Unique Order Identifier
		orderNum := fmt.Sprintf("ORD-%s-%d", time.Now().Format("20060102150405"), createdByID)

		order = models.Order{
			OrderNumber: orderNum,
			Subtotal:    subtotal,
			Tax:         tax,
			Total:       total,
			CreatedByID: createdByID,
			Items:       orderItems,
		}

		// Create Order and nested OrderItems
		if err := tx.Create(&order).Error; err != nil {
			return fmt.Errorf("failed to save order: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Fetch fully hydrated order model to return to client
	return s.orderRepo.GetByID(order.ID)
}

func (s *salesService) GetAllOrders() ([]models.Order, error) {
	return s.orderRepo.GetAll()
}
