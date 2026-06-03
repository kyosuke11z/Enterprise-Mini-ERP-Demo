package middleware

import (
	"net/http"

	"backend/internal/models"

	"github.com/gin-gonic/gin"
)

func RoleMiddleware(allowedRoles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: User role not found"})
			c.Abort()
			return
		}

		userRole, ok := roleVal.(string)
		if !ok {
			// Cast if stored as models.Role type
			if r, isRole := roleVal.(models.Role); isRole {
				userRole = string(r)
			} else {
				c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Invalid role format"})
				c.Abort()
				return
			}
		}

		isAllowed := false
		for _, r := range allowedRoles {
			if string(r) == userRole {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: You do not have permission to access this resource"})
			c.Abort()
			return
		}

		c.Next()
	}
}
