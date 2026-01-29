// main.go
package main

import (
	"net/http"
	"orderbase/handlers"
	"orderbase/models"
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
	db.AutoMigrate(&models.User{}, &models.Product{}, &models.HTMLPage{}, &models.Order{}, &models.CartItem{})

}

func setupRouter() *gin.Engine {
	r := gin.Default()

	// CORS設定（最初に適用）
	r.Use(cors.New(cors.Config{
		AllowMethods:     []string{"GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			// localhost、ポート8080、TailscaleのIPアドレスからのアクセスを許可
			return true // 開発環境では全て許可（本番環境では適切に制限してください）
		},
		MaxAge: 12 * time.Hour,
	}))

	// セッションの設定
	store := cookie.NewStore([]byte("secret"))
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
	r.Use(sessions.Sessions("mysession", store))

	// 静的ファイル
	r.Static("/static", "./static")

	// 静的ファイル（画像）公開
	r.Static("/uploads", "./uploads")
	authHandler := &handlers.AuthHandler{DB: db}
	productHandler := &handlers.ProductHandler{DB: db}
	htmlHandler := &handlers.HTMLHandler{DB: db}
	openaiHandler := &handlers.OpenAIHandler{DB: db}

	api := r.Group("/api")
	{
		api.POST("/register", authHandler.RegisterUser)
		api.POST("/login", authHandler.LoginUser)
		api.GET("/dashboard", handlers.ShowDashboard)
		api.GET("/dashboard/stats", func(c *gin.Context) { handlers.GetDashboardStats(c, db) })
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
		// HTML関連API
		api.GET("/html/list", htmlHandler.ListHTMLPages)
		api.PUT("/html/save/:username/:page", htmlHandler.SaveHTMLPage)
		api.GET("/html/get/:username/:page", htmlHandler.GetHTMLPage)
		api.DELETE("/html/delete/:username/:page", htmlHandler.DeleteHTMLPage)

		// OpenAI関連API
		api.POST("/openai/chat", openaiHandler.ChatCompletion)
		api.POST("/openai/set-key", authHandler.SetOpenAIKey)
		api.GET("/openai/get-key", authHandler.GetOpenAIKey)

		// 商品関連API
		api.POST("/products/upload", productHandler.AddProductWithImage)
		api.PATCH("/products/:id", productHandler.UpdateProduct)
		api.DELETE("/products/:id", productHandler.DeleteProduct)
		api.GET("/products/mine", productHandler.GetMyProducts)

		// 注文関連API
		api.POST("/orders", func(c *gin.Context) { handlers.CreateOrder(c, db) })
		api.GET("/orders", func(c *gin.Context) { handlers.GetOrders(c, db) })
		api.GET("/orders/:id", func(c *gin.Context) { handlers.GetOrderByID(c, db) })
		api.PATCH("/orders/:id/status", func(c *gin.Context) { handlers.UpdateOrderStatus(c, db) })
		api.DELETE("/orders/:id", func(c *gin.Context) { handlers.DeleteOrder(c, db) })

		// カート関連API
		api.POST("/cart", func(c *gin.Context) { handlers.AddToCart(c, db) })
		api.GET("/cart", func(c *gin.Context) { handlers.GetCart(c, db) })
		api.PATCH("/cart/:id", func(c *gin.Context) { handlers.UpdateCartItem(c, db) })
		api.DELETE("/cart/:id", func(c *gin.Context) { handlers.RemoveFromCart(c, db) })
		api.POST("/cart/checkout", func(c *gin.Context) { handlers.CheckoutCart(c, db) })
		api.DELETE("/cart/clear", func(c *gin.Context) { handlers.ClearCart(c, db) })
	}

	// HTMLページを直接レンダリング（Next.js以外からアクセスする場合）
	r.GET("/html/view/:username/:page", htmlHandler.RenderHTMLPage)

	return r
}
