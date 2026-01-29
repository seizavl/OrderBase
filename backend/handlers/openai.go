package handlers

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"orderbase/models"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OpenAIHandler struct {
	DB *gorm.DB
}

type ChatRequest struct {
	Messages []MessageContent `json:"messages"`
}

type MessageContent struct {
	Role    string      `json:"role"`
	Content interface{} `json:"content"`
}

type OpenAIRequest struct {
	Model    string           `json:"model"`
	Messages []MessageContent `json:"messages"`
	MaxTokens int             `json:"max_tokens,omitempty"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

// OpenAI APIを使ってチャット応答を生成
func (h *OpenAIHandler) ChatCompletion(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	// ユーザーのAPIキーを取得
	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ユーザー取得失敗"})
		return
	}

	if user.OpenAIKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OpenAI APIキーが設定されていません"})
		return
	}

	// リクエストボディを取得
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力エラー"})
		return
	}

	// メッセージに画像が含まれているかチェック
	hasImage := false
	for _, msg := range req.Messages {
		if content, ok := msg.Content.([]interface{}); ok {
			for _, item := range content {
				if itemMap, ok := item.(map[string]interface{}); ok {
					if itemMap["type"] == "image_url" {
						hasImage = true
						break
					}
				}
			}
		}
		if hasImage {
			break
		}
	}

	// gpt-4oに統一（より大きなコンテキストウィンドウ: 128k tokens）
	model := "gpt-4o"

	// OpenAI APIリクエストを構築
	openaiReq := OpenAIRequest{
		Model:     model,
		Messages:  req.Messages,
		MaxTokens: 8000, // レート制限を考慮して調整（入力+出力で30k以内に収める）
	}

	reqBody, err := json.Marshal(openaiReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "リクエスト構築失敗"})
		return
	}

	// OpenAI APIを呼び出す
	httpReq, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(reqBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "リクエスト作成失敗"})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+user.OpenAIKey)

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "API呼び出し失敗"})
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "レスポンス読み取り失敗"})
		return
	}

	var openaiResp OpenAIResponse
	if err := json.Unmarshal(body, &openaiResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "レスポンス解析失敗"})
		return
	}

	// エラーチェック
	if openaiResp.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": openaiResp.Error.Message})
		return
	}

	if len(openaiResp.Choices) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "応答がありません"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": openaiResp.Choices[0].Message,
	})
}
