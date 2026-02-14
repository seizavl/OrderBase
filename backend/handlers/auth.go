package handlers

import (
	"net/http"
	"orderbase/models"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

func (h *AuthHandler) ShowRegisterPage(c *gin.Context) {
	c.HTML(http.StatusOK, "register.html", nil)
}

func (h *AuthHandler) RegisterUser(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	user := models.User{Username: req.Username, Password: string(hash)}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "登録失敗（重複？）"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "登録成功"})
}

func (h *AuthHandler) ShowLoginPage(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", nil)
}

func (h *AuthHandler) LoginUser(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力エラー"})
		return
	}

	var user models.User
	if err := h.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ユーザーが見つかりません"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "パスワードが違います"})
		return
	}

	// ✅ ログイン成功 → セッション保存！
	session := sessions.Default(c)
	session.Set("user", user.Username)
	session.Set("user_id", user.ID)
	session.Save()

	c.JSON(http.StatusOK, gin.H{"message": "ログイン成功"})
}

func (h *AuthHandler) LogoutUser(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	session.Save()

	c.JSON(http.StatusOK, gin.H{"message": "ログアウトしました"})
}

// OpenAI APIキーを設定
func (h *AuthHandler) SetOpenAIKey(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var req struct {
		APIKey string `json:"api_key"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力エラー"})
		return
	}

	if err := h.DB.Model(&models.User{}).Where("id = ?", userID).Update("open_ai_key", req.APIKey).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "APIキーを保存しました"})
}

// OpenAI APIキーを取得
func (h *AuthHandler) GetOpenAIKey(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー取得失敗"})
		return
	}

	// APIキーの最初の数文字だけ返す（セキュリティのため）
	maskedKey := ""
	if len(user.OpenAIKey) > 10 {
		maskedKey = user.OpenAIKey[:10] + "..." + user.OpenAIKey[len(user.OpenAIKey)-4:]
	} else if user.OpenAIKey != "" {
		maskedKey = "設定済み"
	}

	c.JSON(http.StatusOK, gin.H{
		"has_key": user.OpenAIKey != "",
		"masked_key": maskedKey,
	})
}

// SetMainMenu メインメニューページを設定
func (h *AuthHandler) SetMainMenu(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var req struct {
		MainMenuPage string `json:"main_menu_page"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力エラー"})
		return
	}

	if err := h.DB.Model(&models.User{}).Where("id = ?", userID).Update("main_menu_page", req.MainMenuPage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "メインメニューを設定しました"})
}

// GetMainMenu メインメニューページを取得
func (h *AuthHandler) GetMainMenu(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー取得失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"main_menu_page": user.MainMenuPage,
	})
}
