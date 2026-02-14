package handlers

import (
	"net/http"
	"orderbase/models"
	"strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TableHandler struct {
	DB *gorm.DB
}

// CreateTable テーブルを作成
func (h *TableHandler) CreateTable(c *gin.Context) {
	// 認証チェック
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	// リクエストパース
	var req struct {
		TableNumber int    `json:"table_number" binding:"required"`
		Capacity    int    `json:"capacity"`
		Status      string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	// ステータスのデフォルト値
	if req.Status == "" {
		req.Status = "active"
	}

	// テーブル番号の重複チェック
	var existingTable models.Table
	if err := h.DB.Where("table_number = ?", req.TableNumber).First(&existingTable).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "このテーブル番号は既に使用されています"})
		return
	}

	// テーブル作成
	table := models.Table{
		TableNumber: req.TableNumber,
		Capacity:    req.Capacity,
		Status:      req.Status,
	}

	if err := h.DB.Create(&table).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの作成に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "テーブルを作成しました",
		"table":   table,
	})
}

// GetTables 全テーブルを取得
func (h *TableHandler) GetTables(c *gin.Context) {
	// 認証チェック
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	var tables []models.Table
	if err := h.DB.Order("table_number ASC").Find(&tables).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの取得に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tables": tables})
}

// GetTableByID テーブル詳細を取得
func (h *TableHandler) GetTableByID(c *gin.Context) {
	// 認証チェック
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	tableID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無効なテーブルIDです"})
		return
	}

	var table models.Table
	if err := h.DB.First(&table, tableID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "テーブルが見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの取得に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, table)
}

// UpdateTable テーブルを更新
func (h *TableHandler) UpdateTable(c *gin.Context) {
	// 認証チェック
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	tableID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無効なテーブルIDです"})
		return
	}

	// リクエストパース
	var req struct {
		TableNumber *int    `json:"table_number"`
		Capacity    *int    `json:"capacity"`
		Status      *string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	// テーブルの存在確認
	var table models.Table
	if err := h.DB.First(&table, tableID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "テーブルが見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの取得に失敗しました"})
		return
	}

	// テーブル番号の重複チェック
	if req.TableNumber != nil && *req.TableNumber != table.TableNumber {
		var existingTable models.Table
		if err := h.DB.Where("table_number = ?", *req.TableNumber).First(&existingTable).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "このテーブル番号は既に使用されています"})
			return
		}
	}

	// 更新
	updates := make(map[string]interface{})
	if req.TableNumber != nil {
		updates["table_number"] = *req.TableNumber
	}
	if req.Capacity != nil {
		updates["capacity"] = *req.Capacity
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	if err := h.DB.Model(&table).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの更新に失敗しました"})
		return
	}

	// 更新後のデータを取得
	h.DB.First(&table, tableID)

	c.JSON(http.StatusOK, gin.H{
		"message": "テーブルを更新しました",
		"table":   table,
	})
}

// DeleteTable テーブルを削除
func (h *TableHandler) DeleteTable(c *gin.Context) {
	// 認証チェック
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	tableID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無効なテーブルIDです"})
		return
	}

	// テーブルの存在確認
	var table models.Table
	if err := h.DB.First(&table, tableID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "テーブルが見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの取得に失敗しました"})
		return
	}

	// ソフトデリート（statusをinactiveに変更）を推奨
	// ハードデリートする場合は以下をコメントアウトして h.DB.Delete(&table).Error を使用
	if err := h.DB.Model(&table).Update("status", "inactive").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの削除に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "テーブルを削除しました"})
}

// GetTableOrders テーブル別の注文履歴を取得
func (h *TableHandler) GetTableOrders(c *gin.Context) {
	// 認証チェック
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	tableID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無効なテーブルIDです"})
		return
	}

	// テーブルの存在確認
	var table models.Table
	if err := h.DB.First(&table, tableID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "テーブルが見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "テーブルの取得に失敗しました"})
		return
	}

	// テーブルに紐づく注文を取得
	var orders []models.Order
	if err := h.DB.Where("table_id = ?", tableID).
		Preload("Product").
		Preload("User").
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注文の取得に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"table":  table,
		"orders": orders,
	})
}
