package main

import (
	"log"
	"net/http"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func main() {
	log.Println("Starting Enterprise Mini ERP Go Backend...")

	// 1. Load Configurations
	cfg := config.LoadConfig()

	// 2. Initialize Database
	db := database.InitDB(cfg.DatabaseURL)

	// 3. Setup Layered Dependencies (N-Tier Architecture)
	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	userService := service.NewUserService(userRepo)
	productService := service.NewProductService(productRepo)
	salesService := service.NewSalesService(db, orderRepo)

	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	productHandler := handler.NewProductHandler(productService)
	salesHandler := handler.NewSalesHandler(salesService)

	// 4. Initialize HTTP Server
	r := gin.Default()

	// 5. Apply Global Secure Middlewares (OWASP Alignment)
	r.Use(middleware.HelmetMiddleware())

	// Configure CORS for Next.js Frontend compatibility (Support cookies/credentials)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Dynamic IP Rate Limiter (e.g. max 100 requests per minute with burst of 20)
	rateLimiter := middleware.NewIPRateLimiter(rate.Limit(1.67), 20)
	r.Use(middleware.RateLimitMiddleware(rateLimiter))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "time": time.Now().Format(time.RFC3339)})
	})

	// 6. Router Setup
	api := r.Group("/api")
	{
		// PUBLIC Auth endpoints
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/logout", authHandler.Logout)
		}

		// AUTHENTICATED endpoints
		authRequired := api.Group("/")
		authRequired.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Current user info
			authRequired.GET("/auth/me", authHandler.GetMe)

			// POS Catalog - Available to both STAFF & ADMIN
			authRequired.GET("/products", productHandler.GetAll)
			authRequired.GET("/products/:id", productHandler.GetByID)

			// POS Checkout - Available to both STAFF & ADMIN
			authRequired.POST("/sales/checkout", salesHandler.Checkout)
			authRequired.GET("/sales/orders", salesHandler.GetAllOrders)

			// ADMIN ONLY routes (RBAC)
			adminGroup := authRequired.Group("/")
			adminGroup.Use(middleware.RoleMiddleware(models.RoleAdmin))
			{
				// Product Catalog CRUD
				adminGroup.POST("/products", productHandler.Create)
				adminGroup.PUT("/products/:id", productHandler.Update)
				adminGroup.DELETE("/products/:id", productHandler.Delete)

				// User Management CRUD
				adminGroup.GET("/users", userHandler.GetAll)
				adminGroup.POST("/users", userHandler.Create)
				adminGroup.PUT("/users/:id", userHandler.Update)
				adminGroup.DELETE("/users/:id", userHandler.Delete)
			}
		}
	}

	log.Printf("Server listening on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Fatal: Server failed to start: %v", err)
	}
}
