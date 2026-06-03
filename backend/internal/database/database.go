package database

import (
	"log"
	"time"

	"backend/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB(dbURL string) *gorm.DB {
	var db *gorm.DB
	var err error

	// Retry database connection if container is starting up
	for i := 0; i < 10; i++ {
		db, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database. Retrying in 3 seconds... (Attempt %d/10)", i+1)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("Fatal: Database connection failed: %v", err)
	}

	log.Println("Database connection established successfully.")

	// Auto-Migrate Models
	err = db.AutoMigrate(&models.User{}, &models.Product{}, &models.Order{}, &models.OrderItem{})
	if err != nil {
		log.Fatalf("Fatal: Database migration failed: %v", err)
	}

	log.Println("Database auto-migration completed.")

	// Seed default data
	SeedData(db)

	return db
}

func SeedData(db *gorm.DB) {
	// 1. Seed Users
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		log.Println("Seeding default users...")

		adminHash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		staffHash, _ := bcrypt.GenerateFromPassword([]byte("staff123"), bcrypt.DefaultCost)

		users := []models.User{
			{
				Username:   "admin",
				Password:   string(adminHash),
				Name:       "System Admin",
				Role:       models.RoleAdmin,
				Email:      "admin@minierp.com",
				Department: "IT Operations",
				IsActive:   true,
			},
			{
				Username:   "staff",
				Password:   string(staffHash),
				Name:       "สมศรี ดีใจ",
				Role:       models.RoleStaff,
				Email:      "somsri.d@minierp.com",
				Department: "Sales",
				IsActive:   true,
			},
		}

		for _, u := range users {
			if err := db.Create(&u).Error; err != nil {
				log.Printf("Error seeding user %s: %v", u.Username, err)
			}
		}
	}

	// 2. Seed Products
	var productCount int64
	db.Model(&models.Product{}).Count(&productCount)
	if productCount == 0 {
		log.Println("Seeding default products catalog...")

		products := []models.Product{
			{
				Code:        "PRD-001",
				Name:        "Cyber Deck Kyb-01",
				Category:    "Tech",
				Stock:       50,
				Price:       3500.00,
				ImageURL:    "https://lh3.googleusercontent.com/aida-public/AB6AXuCEJhlTrVXqe6XdHKsFhaqyNbSQsOV0wHv8F1HBaTGELeNTe4akaAuAVUofi2BcAMJgej-LPCKqjHLEpbPccWwTvL8-nGPKblg0HB0L1ED3vz0LbvPGErWmN0agvCzFD8Gd9sLU8j5vgIdmuVcD-b35CUNNiST0YQXcGs6ysHkd1L0jzob55q1PLCCoVBwcIJ6oxcWurl7AuG4wZkUqNzYz39jamGzbeND816gHSNgEZzb8sF1hCNIEeyy2mgk8O-PhoYJ13Z32LY8",
				Description: "Glowing neon cyan and pink mechanical keyboard.",
			},
			{
				Code:        "PRD-002",
				Name:        "Neon Syn-Juice",
				Category:    "Drinks",
				Stock:       100,
				Price:       120.00,
				ImageURL:    "https://lh3.googleusercontent.com/aida-public/AB6AXuAEo183q9uQEF954ctrs9dAm-Jo_KdFf9QbKqYVEYz0fiFBJ86Ffb0EIvVwhRsabcn4bIaMjr_sr3uzqmE6m1cCEcXg2pJ7417Qh70C42BiZulNlIkx6IE7t8kmswoSc1yywu2Yad3pTTzT71DPhu4-ca4pkHsT2G4WExhPR53L1U4j9n0hZQjscK2Sw2gZ9JVJPPC7TRDosohgY8f-2zh6mD4JXL9rtIGlCpULNhSfFJtgRjZrlnJMns6HYi1R3iwZGeZ-L3fPlII",
				Description: "High energy synthetic drink in metallic cans.",
			},
			{
				Code:        "PRD-003",
				Name:        "Oculus X-Tension",
				Category:    "Tech",
				Stock:       10,
				Price:       12900.00,
				ImageURL:    "https://lh3.googleusercontent.com/aida-public/AB6AXuDynpKg-r4uRDaINA4drQ0WXHJhZm4yIWjNI_R8thba_Kk10Rb6OVbfbfy76Q_EMsevHHthTLGhpXtCw1-hKk6ph-uryZtOiRdP6L3GKoSO0w479ZQ7ewcnT-gmHomX6dwkO_Cv5pfrlpC8KwmQggxK0d5HG7CQoLqakcvm_PMVxMO77spy64vp1IHVxpPvt-OqfXbbL4ijumhMUtawRn9B79Ao2ZYGk2cY7rw_oyplsUIPyww0OEInZmJxCv1tT9TVCaiw06Y6y3A",
				Description: "Cyberpunk stylized high-end virtual reality headset.",
			},
			{
				Code:        "PRD-004",
				Name:        "Sonic Pods Evo",
				Category:    "Tech",
				Stock:       25,
				Price:       4200.00,
				ImageURL:    "https://lh3.googleusercontent.com/aida-public/AB6AXuDM3uWGByfy3bQTaCIBt1LSAkpzOeXmo9A7FKKVSIO_raDM8nArNT_yKBUf9pi6x_a25pegWQDRx67V8NBtTPmkqB3clOy4Hm8OR7125uyk-eNlCkafaKY-Fs_svNYnvThuKXK0wq1jV__bJQ9g6wuK6Djm8WiNwGKie_wFfb-lrTqgWEapUtRNBgXfVFYy58_NoYAuHjXWfAJkmyfOWtxcGQjErexfHkihUQcPcFh0cj31kJ43mBTzmReydoRnTB5VNqAGZX8n1fQ",
				Description: "Wireless earbuds with dynamic neon accents.",
			},
			{
				Code:        "PRD-042",
				Name:        "Neon Synth Keyboard",
				Category:    "Peripherals",
				Stock:       4,
				Price:       4200.00,
				ImageURL:    "https://lh3.googleusercontent.com/aida-public/AB6AXuCyXw-bKqWvmeYOk15Q7QNct6Lu1dCcyuBtecYT6wZ7_WxZVqmCF4c58J-5EBfFXQqr6jAZyuJsUoaOXc7fo3GWrt_77MH8xeSLS0vZdTDwzIXZSt2seMOmDvL-4d_mM4KcYMqnjX3mJBVcokG9KAMTYlla9ibxTREJZbumRCAY3QaRzaYxFbH6WU9U6od3NeCUoq7yQ-rxIb791vgmmf2WA2izEC-hQg0quw_-Yiu7xd3r3vNSduk8gLkS5fWlSV6w9o0suvzA0aU",
				Description: "Mechanical keycaps with neon glow elements.",
			},
			{
				Code:        "PRD-088",
				Name:        "Optic Cable 10m",
				Category:    "Accessories",
				Stock:       56,
				Price:       850.00,
				ImageURL:    "",
				Description: "High-speed light transmission cables.",
			},
		}

		for _, p := range products {
			if err := db.Create(&p).Error; err != nil {
				log.Printf("Error seeding product %s: %v", p.Name, err)
			}
		}
	}
}
