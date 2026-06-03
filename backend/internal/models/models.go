package models

import (
	"time"
)

type Role string

const (
	RoleAdmin Role = "ADMIN"
	RoleStaff Role = "STAFF"
)

type User struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Username   string    `gorm:"uniqueIndex;not null" json:"username" binding:"required"`
	Password   string    `gorm:"not null" json:"-"` // Never return password in responses
	Name       string    `gorm:"not null" json:"name" binding:"required"`
	Role       Role      `gorm:"type:varchar(20);not null" json:"role" binding:"required,oneof=ADMIN STAFF"`
	Email      string    `gorm:"uniqueIndex;not null" json:"email" binding:"required,email"`
	Department string    `json:"department"`
	IsActive   bool      `gorm:"default:true" json:"isActive"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Code        string    `gorm:"uniqueIndex;not null" json:"code" binding:"required"`
	Name        string    `gorm:"index;not null" json:"name" binding:"required"`
	Category    string    `gorm:"index;not null" json:"category" binding:"required"`
	Stock       int       `gorm:"not null" json:"stock" binding:"required,min=0"`
	Price       float64   `gorm:"type:numeric(12,2);not null" json:"price" binding:"required,min=0"`
	ImageURL    string    `json:"imageUrl"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Order struct {
	ID          uint        `gorm:"primaryKey" json:"id"`
	OrderNumber string      `gorm:"uniqueIndex;not null" json:"orderNumber"`
	Subtotal    float64     `gorm:"type:numeric(12,2);not null" json:"subtotal"`
	Tax         float64     `gorm:"type:numeric(12,2);not null" json:"tax"`
	Total       float64     `gorm:"type:numeric(12,2);not null" json:"total"`
	CreatedByID uint        `gorm:"not null" json:"createdById"`
	CreatedBy   User        `gorm:"foreignKey:CreatedByID" json:"createdBy"`
	Items       []OrderItem `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"items"`
	CreatedAt   time.Time   `json:"createdAt"`
}

type OrderItem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	OrderID   uint    `gorm:"index;not null" json:"orderId"`
	ProductID uint    `gorm:"index;not null" json:"productId"`
	Product   Product `gorm:"foreignKey:ProductID" json:"product"`
	Quantity  int     `gorm:"not null" json:"quantity" binding:"required,min=1"`
	Price     float64 `gorm:"type:numeric(12,2);not null" json:"price" binding:"required,min=0"`
}
