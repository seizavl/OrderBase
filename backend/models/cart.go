package models

import (
	"time"
)

// CartItem カート内の商品
type CartItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	SessionID string    `gorm:"index" json:"session_id"` // セッションID（ログイン不要）
	ProductID uint      `json:"product_id"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// リレーション
	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}
