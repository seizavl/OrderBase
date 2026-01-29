package handlers

import (
	"net/http"
	"orderbase/models"
	"strconv"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AddToCartRequest カート追加リクエスト
type AddToCartRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

// GetOrCreateSessionID セッションIDを取得または作成
func GetOrCreateSessionID(c *gin.Context) string {
	session := sessions.Default(c)
	sessionID := session.Get("cart_session_id")

	if sessionID == nil {
		// 新しいセッションIDを生成
		sessionID = generateSessionID()
		session.Set("cart_session_id", sessionID)
		session.Save()
	}

	return sessionID.(string)
}

// generateSessionID ランダムなセッションIDを生成
func generateSessionID() string {
	// 簡易的な実装（本番環境ではより安全な方法を使用）
	return strconv.FormatInt(time.Now().UnixNano(), 36)
}

// AddToCart カートに商品を追加
func AddToCart(c *gin.Context, db *gorm.DB) {
	sessionID := GetOrCreateSessionID(c)

	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	// 商品が存在するか確認
	var product models.Product
	if err := db.First(&product, req.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "商品が見つかりません"})
		return
	}

	// 既にカートにある場合は数量を更新
	var existingItem models.CartItem
	if err := db.Where("session_id = ? AND product_id = ?", sessionID, req.ProductID).First(&existingItem).Error; err == nil {
		existingItem.Quantity += req.Quantity
		db.Save(&existingItem)
		db.Preload("Product").First(&existingItem, existingItem.ID)
		c.JSON(http.StatusOK, gin.H{
			"message": "カートを更新しました",
			"item":    existingItem,
		})
		return
	}

	// 新規追加
	cartItem := models.CartItem{
		SessionID: sessionID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
	}

	if err := db.Create(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "カートへの追加に失敗しました"})
		return
	}

	db.Preload("Product").First(&cartItem, cartItem.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "カートに追加しました",
		"item":    cartItem,
	})
}

// GetCart カート内容を取得
func GetCart(c *gin.Context, db *gorm.DB) {
	sessionID := GetOrCreateSessionID(c)

	var cartItems []models.CartItem
	if err := db.Where("session_id = ?", sessionID).
		Preload("Product").
		Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "カートの取得に失敗しました"})
		return
	}

	// 合計金額を計算
	totalPrice := 0
	for _, item := range cartItems {
		totalPrice += item.Product.Price * item.Quantity
	}

	c.JSON(http.StatusOK, gin.H{
		"items":       cartItems,
		"total_price": totalPrice,
		"item_count":  len(cartItems),
	})
}

// UpdateCartItem カート内商品の数量を更新
func UpdateCartItem(c *gin.Context, db *gorm.DB) {
	sessionID := GetOrCreateSessionID(c)
	itemID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なIDです"})
		return
	}

	var req struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	var cartItem models.CartItem
	if err := db.Where("id = ? AND session_id = ?", itemID, sessionID).First(&cartItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "カート内に商品が見つかりません"})
		return
	}

	cartItem.Quantity = req.Quantity
	db.Save(&cartItem)
	db.Preload("Product").First(&cartItem, cartItem.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "数量を更新しました",
		"item":    cartItem,
	})
}

// RemoveFromCart カートから商品を削除
func RemoveFromCart(c *gin.Context, db *gorm.DB) {
	sessionID := GetOrCreateSessionID(c)
	itemID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なIDです"})
		return
	}

	var cartItem models.CartItem
	if err := db.Where("id = ? AND session_id = ?", itemID, sessionID).First(&cartItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "カート内に商品が見つかりません"})
		return
	}

	if err := db.Delete(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "削除に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "カートから削除しました"})
}

// CheckoutCart カート内商品をまとめて注文（ゲスト購入対応）
func CheckoutCart(c *gin.Context, db *gorm.DB) {
	session := sessions.Default(c)
	sessionID := GetOrCreateSessionID(c)

	// ユーザーIDを取得（ログインしていればセット、していなければnil）
	var userID *uint
	if uid := session.Get("user_id"); uid != nil {
		uidUint := uid.(uint)
		userID = &uidUint
	}

	// カート内容を取得
	var cartItems []models.CartItem
	if err := db.Where("session_id = ?", sessionID).
		Preload("Product").
		Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "カートの取得に失敗しました"})
		return
	}

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "カートが空です"})
		return
	}

	// トランザクション開始
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var orders []models.Order
	totalAmount := 0

	// カート内の各商品を注文に変換
	for _, item := range cartItems {
		order := models.Order{
			UserID:     userID, // nilでもOK（ゲスト購入）
			ProductID:  item.ProductID,
			Quantity:   item.Quantity,
			TotalPrice: item.Product.Price * item.Quantity,
			Status:     "pending",
		}

		if err := tx.Create(&order).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "注文の作成に失敗しました"})
			return
		}

		totalAmount += order.TotalPrice
		orders = append(orders, order)
	}

	// カートをクリア
	if err := tx.Where("session_id = ?", sessionID).Delete(&models.CartItem{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "カートのクリアに失敗しました"})
		return
	}

	// コミット
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注文の確定に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "注文が完了しました",
		"orders":       orders,
		"total_amount": totalAmount,
		"order_count":  len(orders),
	})
}

// ClearCart カートを空にする
func ClearCart(c *gin.Context, db *gorm.DB) {
	sessionID := GetOrCreateSessionID(c)

	if err := db.Where("session_id = ?", sessionID).Delete(&models.CartItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "カートのクリアに失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "カートをクリアしました"})
}
