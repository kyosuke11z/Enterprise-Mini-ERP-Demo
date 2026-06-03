package handler

import (
	"net/http"

	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type SalesHandler struct {
	salesService service.SalesService
}

func NewSalesHandler(salesService service.SalesService) *SalesHandler {
	return &SalesHandler{
		salesService: salesService,
	}
}

func (h *SalesHandler) Checkout(c *gin.Context) {
	// Extract authenticated user ID from Context (populated by AuthMiddleware)
	userIDVal, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: user identity missing"})
		return
	}
	userID, ok := userIDVal.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error: user ID has wrong format"})
		return
	}

	var req service.CheckoutReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid checkout payload: " + err.Error()})
		return
	}

	order, err := h.salesService.Checkout(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *SalesHandler) GetAllOrders(c *gin.Context) {
	orders, err := h.salesService.GetAllOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve order history: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, orders)
}
