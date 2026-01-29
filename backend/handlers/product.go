package handlers

import (
	"fmt"
	"net/http"
	"orderbase/models"

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
	labels := c.PostForm("labels")

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
		Labels:    labels,
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

	productID := c.Param("id")

	// まず商品が存在し、かつユーザーの所有物であることを確認
	var product models.Product
	if err := h.DB.First(&product, productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "商品が見つかりません"})
		return
	}

	// 所有者チェック
	if product.UserID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "他のユーザーの商品は削除できません"})
		return
	}

	// 削除実行
	if err := h.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "削除失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "削除完了"})
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
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

	productID := c.Param("id")

	// 商品が存在し、かつユーザーの所有物であることを確認
	var product models.Product
	if err := h.DB.First(&product, productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "商品が見つかりません"})
		return
	}

	// 所有者チェック
	if product.UserID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "他のユーザーの商品は編集できません"})
		return
	}

	// フォームデータを取得
	name := c.PostForm("name")
	priceStr := c.PostForm("price")
	labels := c.PostForm("labels")

	// 更新
	if name != "" {
		product.Name = name
	}
	if priceStr != "" {
		var price int
		fmt.Sscanf(priceStr, "%d", &price)
		product.Price = price
	}
	// ラベルは空文字列も許可（削除できるように）
	product.Labels = labels

	if err := h.DB.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "更新完了", "product": product})
}
