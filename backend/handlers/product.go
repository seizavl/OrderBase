package handlers

import (
	"fmt"
	"gotest/models"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductHandler struct {
	DB *gorm.DB
}

func (h *ProductHandler) AddProductWithImage(c *gin.Context) {
	session := sessions.Default(c)
	username := session.Get("user")
	if username == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var user models.User
	if err := h.DB.Where("username = ?", username.(string)).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー取得失敗"})
		return
	}

	name := c.PostForm("name")
	priceStr := c.PostForm("price")

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "画像ファイルが必要です"})
		return
	}

	imagePath := "uploads/" + file.Filename
	if err := c.SaveUploadedFile(file, imagePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "画像保存失敗"})
		return
	}

	var price int
	fmt.Sscanf(priceStr, "%d", &price)

	product := models.Product{
		Name:      name,
		Price:     price,
		ImagePath: "/" + imagePath,
		UserID:    user.ID,
	}

	if err := h.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "商品登録失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "商品登録成功"})
}

func (h *ProductHandler) GetMyProducts(c *gin.Context) {
	session := sessions.Default(c)
	username := session.Get("user")
	if username == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var user models.User
	if err := h.DB.Where("username = ?", username.(string)).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー取得失敗"})
		return
	}

	var products []models.Product
	if err := h.DB.Preload("User").Where("user_id = ?", user.ID).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "商品取得失敗"})
		return
	}

	// 商品が0件でも正常レスポンスとして返す
	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	session := sessions.Default(c)
	username := session.Get("user")
	if username == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var user models.User
	if err := h.DB.Where("username = ?", username.(string)).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー取得失敗"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "削除完了"})
}
