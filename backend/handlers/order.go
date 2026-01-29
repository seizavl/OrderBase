package handlers

import (
	"net/http"
	"orderbase/models"
	"strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateOrderRequest 注文作成リクエスト
type CreateOrderRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

// CreateOrder 注文を作成
func CreateOrder(c *gin.Context, db *gorm.DB) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	// 商品情報を取得
	var product models.Product
	if err := db.Where("id = ? AND user_id = ?", req.ProductID, userID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "商品が見つかりません"})
		return
	}

	// 注文を作成
	uidUint := userID.(uint)
	order := models.Order{
		UserID:     &uidUint,
		ProductID:  req.ProductID,
		Quantity:   req.Quantity,
		TotalPrice: product.Price * req.Quantity,
		Status:     "pending",
	}

	if err := db.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注文の作成に失敗しました"})
		return
	}

	// 商品情報を含めて返す
	db.Preload("Product").First(&order, order.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "注文を作成しました",
		"order":   order,
	})
}

// GetOrders 注文一覧を取得（ダッシュボード用：全注文を表示）
func GetOrders(c *gin.Context, db *gorm.DB) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	// ダッシュボードでは全注文を表示（ゲスト購入を含む）
	var orders []models.Order
	if err := db.Preload("Product").
		Preload("User").
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注文の取得に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

// GetOrderByID 注文詳細を取得
func GetOrderByID(c *gin.Context, db *gorm.DB) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なIDです"})
		return
	}

	var order models.Order
	if err := db.Where("id = ? AND user_id = ?", orderID, userID).
		Preload("Product").
		First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "注文が見つかりません"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// UpdateOrderStatus 注文ステータスを更新（ゲスト注文を含む全注文対応）
func UpdateOrderStatus(c *gin.Context, db *gorm.DB) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なIDです"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=pending completed cancelled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	// ゲスト注文も含めて全注文を更新可能に
	var order models.Order
	if err := db.Where("id = ?", orderID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "注文が見つかりません"})
		return
	}

	order.Status = req.Status
	if err := db.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ステータスの更新に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ステータスを更新しました",
		"order":   order,
	})
}

// DeleteOrder 注文を削除
func DeleteOrder(c *gin.Context, db *gorm.DB) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なIDです"})
		return
	}

	var order models.Order
	if err := db.Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "注文が見つかりません"})
		return
	}

	if err := db.Delete(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "削除に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "注文を削除しました"})
}
