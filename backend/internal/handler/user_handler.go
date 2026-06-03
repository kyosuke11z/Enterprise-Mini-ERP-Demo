package handler

import (
	"net/http"
	"strconv"

	"backend/internal/models"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) GetAll(c *gin.Context) {
	users, err := h.userService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

type createUserReq struct {
	Username   string      `json:"username" binding:"required"`
	Password   string      `json:"password" binding:"required,min=6"`
	Name       string      `json:"name" binding:"required"`
	Role       models.Role `json:"role" binding:"required,oneof=ADMIN STAFF"`
	Email      string      `json:"email" binding:"required,email"`
	Department string      `json:"department"`
}

func (h *UserHandler) Create(c *gin.Context) {
	var req createUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := models.User{
		Username:   req.Username,
		Name:       req.Name,
		Role:       req.Role,
		Email:      req.Email,
		Department: req.Department,
		IsActive:   true,
	}

	err := h.userService.Create(&user, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

type updateUserReq struct {
	Name       string      `json:"name" binding:"required"`
	Role       models.Role `json:"role" binding:"required,oneof=ADMIN STAFF"`
	Email      string      `json:"email" binding:"required,email"`
	Department string      `json:"department"`
	Password   string      `json:"password"`
	IsActive   *bool       `json:"isActive" binding:"required"`
}

func (h *UserHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	user, err := h.userService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var req updateUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Name = req.Name
	user.Role = req.Role
	user.Email = req.Email
	user.Department = req.Department
	user.IsActive = *req.IsActive

	err = h.userService.Update(user, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	err = h.userService.Delete(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
