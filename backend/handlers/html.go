package handlers

import (
	"io/ioutil"
	"net/http"
	"orderbase/models"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HTMLHandler struct {
	DB *gorm.DB
}

// HTMLページをデータベースに保存
func (h *HTMLHandler) SaveHTMLPage(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	username := session.Get("user")
	if userID == nil || username == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	urlUsername := c.Param("username")
	pageName := c.Param("page")

	// URLのユーザー名とセッションのユーザー名が一致するか確認
	if urlUsername != username.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "他のユーザーのページは保存できません"})
		return
	}

	if pageName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ページ名が必要です"})
		return
	}

	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "HTMLの読み込み失敗"})
		return
	}

	htmlContent := string(body)

	// 既存のページがあるか確認（同じユーザーのページのみ）
	var existingPage models.HTMLPage
	result := h.DB.Where("name = ? AND user_id = ?", pageName, userID).First(&existingPage)

	if result.Error == gorm.ErrRecordNotFound {
		// 新規作成
		newPage := models.HTMLPage{
			Name:    pageName,
			Content: htmlContent,
			UserID:  userID.(uint),
		}
		if err := h.DB.Create(&newPage).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失敗"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "保存成功", "id": newPage.ID})
	} else {
		// 既存ページを更新（自分のページのみ）
		existingPage.Content = htmlContent
		if err := h.DB.Save(&existingPage).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失敗"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "更新成功", "id": existingPage.ID})
	}
}

// HTMLページを取得（API用）
func (h *HTMLHandler) GetHTMLPage(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	username := session.Get("user")
	if userID == nil || username == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	urlUsername := c.Param("username")
	pageName := c.Param("page")

	// URLのユーザー名とセッションのユーザー名が一致するか確認
	if urlUsername != username.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "他のユーザーのページにアクセスできません"})
		return
	}

	if pageName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ページ名が必要です"})
		return
	}

	var page models.HTMLPage
	if err := h.DB.Where("name = ? AND user_id = ?", pageName, userID).First(&page).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ページが見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "取得失敗"})
		return
	}

	c.JSON(http.StatusOK, page)
}

// HTMLページのコンテンツを直接表示（公開ページ - ログイン不要）
func (h *HTMLHandler) RenderHTMLPage(c *gin.Context) {
	urlUsername := c.Param("username")
	pageName := c.Param("page")

	if pageName == "" || urlUsername == "" {
		c.String(http.StatusBadRequest, "ユーザー名とページ名が必要です")
		return
	}

	// ユーザー名からユーザーIDを取得
	var user models.User
	if err := h.DB.Where("username = ?", urlUsername).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.String(http.StatusNotFound, "ユーザーが見つかりません")
			return
		}
		c.String(http.StatusInternalServerError, "ユーザー取得失敗")
		return
	}

	// ページを取得
	var page models.HTMLPage
	if err := h.DB.Where("name = ? AND user_id = ?", pageName, user.ID).First(&page).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.String(http.StatusNotFound, "ページが見つかりません")
			return
		}
		c.String(http.StatusInternalServerError, "取得失敗")
		return
	}

	// セキュリティヘッダーを設定（モバイル対応）
	c.Header("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src * data: blob:; style-src * 'unsafe-inline';")
	c.Header("X-Content-Type-Options", "nosniff")
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Credentials", "true")
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(page.Content))
}

// 全HTMLページのリストを取得
func (h *HTMLHandler) ListHTMLPages(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var pages []models.HTMLPage
	if err := h.DB.Where("user_id = ?", userID).Select("id, name, created_at, updated_at, user_id").Find(&pages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "取得失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pages": pages})
}

// HTMLページを削除
func (h *HTMLHandler) DeleteHTMLPage(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	username := session.Get("user")
	if userID == nil || username == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	urlUsername := c.Param("username")
	pageName := c.Param("page")

	// URLのユーザー名とセッションのユーザー名が一致するか確認
	if urlUsername != username.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "他のユーザーのページは削除できません"})
		return
	}

	if pageName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ページ名が必要です"})
		return
	}

	// ページが存在し、かつユーザーの所有物であることを確認
	var page models.HTMLPage
	if err := h.DB.Where("name = ? AND user_id = ?", pageName, userID).First(&page).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ページが見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "取得失敗"})
		return
	}

	// 削除実行
	if err := h.DB.Delete(&page).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "削除失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "削除完了"})
}
