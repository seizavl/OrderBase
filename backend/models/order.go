package models

import (
	"time"
)

// Order 注文情報
type Order struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    *uint     `json:"user_id,omitempty"` // ゲスト購入のためオプショナル
	ProductID uint      `json:"product_id"`
	Quantity  int       `json:"quantity"`
	TotalPrice int      `json:"total_price"`
	Status    string    `json:"status"` // pending, completed, cancelled
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// リレーション
	User    *User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}
