package service

import (
	"testing"

	"backend/internal/models"
	"backend/internal/repository"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func TestSalesService_Checkout(t *testing.T) {
	// 1. Setup in-memory SQLite DB
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open SQLite in-memory database: %v", err)
	}

	// Auto-Migrate Schemas
	err = db.AutoMigrate(&models.User{}, &models.Product{}, &models.Order{}, &models.OrderItem{})
	if err != nil {
		t.Fatalf("Database auto-migration failed: %v", err)
	}

	// 2. Seed test data
	user := models.User{
		Username: "teststaff",
		Password: "pwd",
		Name:     "Test Staff",
		Role:     models.RoleStaff,
		Email:    "staff@minierp.com",
		IsActive: true,
	}
	db.Create(&user)

	prod1 := models.Product{
		Code:     "P1",
		Name:     "Cyber Deck",
		Category: "Tech",
		Stock:    10,
		Price:    100.00,
	}
	prod2 := models.Product{
		Code:     "P2",
		Name:     "Neon Juice",
		Category: "Drinks",
		Stock:    5,
		Price:    20.00,
	}
	db.Create(&prod1)
	db.Create(&prod2)

	orderRepo := repository.NewOrderRepository(db)
	salesService := NewSalesService(db, orderRepo)

	// Test Case 1: Valid Checkout transaction
	t.Run("Valid Checkout", func(t *testing.T) {
		req := CheckoutReq{
			Items: []CheckoutItemReq{
				{ProductID: prod1.ID, Quantity: 2, Price: prod1.Price},
				{ProductID: prod2.ID, Quantity: 1, Price: prod2.Price},
			},
		}

		order, err := salesService.Checkout(user.ID, req)
		if err != nil {
			t.Fatalf("Expected checkout to succeed, got error: %v", err)
		}

		if order == nil {
			t.Fatal("Expected order to be created and returned")
		}

		expectedSubtotal := (2 * prod1.Price) + (1 * prod2.Price)
		if order.Subtotal != expectedSubtotal {
			t.Errorf("Expected subtotal %f, got: %f", expectedSubtotal, order.Subtotal)
		}

		// Verify stock deduction in DB
		var p1, p2 models.Product
		db.First(&p1, prod1.ID)
		db.First(&p2, prod2.ID)

		if p1.Stock != 8 {
			t.Errorf("Expected product 1 stock to be 8, got: %d", p1.Stock)
		}
		if p2.Stock != 4 {
			t.Errorf("Expected product 2 stock to be 4, got: %d", p2.Stock)
		}
	})

	// Test Case 2: Insufficient Stock - Transaction Rollback Verification
	t.Run("Insufficient Stock Rollback", func(t *testing.T) {
		// Attempt checkout with quantity exceeding prod2 stock (remaining stock of prod2 is now 4)
		req := CheckoutReq{
			Items: []CheckoutItemReq{
				{ProductID: prod1.ID, Quantity: 1, Price: prod1.Price},
				{ProductID: prod2.ID, Quantity: 10, Price: prod2.Price}, // Exceeds stock (available 4)
			},
		}

		_, err := salesService.Checkout(user.ID, req)
		if err == nil {
			t.Fatal("Expected checkout to fail due to insufficient stock, but it succeeded")
		}

		// Verify transaction rolled back:
		// Product 1 stock should still be 8 (it was not deducted because transaction failed)
		var p1, p2 models.Product
		db.First(&p1, prod1.ID)
		db.First(&p2, prod2.ID)

		if p1.Stock != 8 {
			t.Errorf("Expected product 1 stock to remain 8 after rollback, got: %d", p1.Stock)
		}
		if p2.Stock != 4 {
			t.Errorf("Expected product 2 stock to remain 4 after rollback, got: %d", p2.Stock)
		}
	})
}
