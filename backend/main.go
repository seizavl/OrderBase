// main.go
package main

import (
	"gotest/handlers"
	"gotest/models"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	initDB()
	r := setupRouter()
	r.Run(":8080")
}

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("users.db"), &gorm.Config{})
	if err != nil {
		panic("DB接続失敗")
	}
	// Tag関連を除外し、ProductはJSON形式のtagsで管理
	db.AutoMigrate(&models.User{}, &models.Product{})

}

func setupRouter() *gin.Engine {
	r := gin.Default()

	// セッションの設定
	store := cookie.NewStore([]byte("secret"))
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   false,
	})
	r.Use(sessions.Sessions("mysession", store))

	// CORS設定
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 静的ファイル（画像）公開
	r.Static("/uploads", "./uploads")
	authHandler := &handlers.AuthHandler{DB: db}
	productHandler := &handlers.ProductHandler{DB: db}

	api := r.Group("/api")
	{
		api.POST("/register", authHandler.RegisterUser)
		api.POST("/login", authHandler.LoginUser)
		api.GET("/dashboard", handlers.ShowDashboard)
		api.GET("/logout", authHandler.LogoutUser)
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "pong"})
		})
		api.GET("/users", func(c *gin.Context) {
			var users []models.User
			if err := db.Find(&users).Error; err != nil {
				c.JSON(500, gin.H{"error": "ユーザー取得失敗"})
				return
			}
			c.JSON(200, users)
		})

		// 商品登録・取得・削除
		api.POST("/products/upload", productHandler.AddProductWithImage)
		api.DELETE("/products/:id", productHandler.DeleteProduct)
		api.GET("/products/mine", productHandler.GetMyProducts)
	}

	return r
}
