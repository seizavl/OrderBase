package models

import (
	"time"
)

type Product struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Name      string    `json:"name"`
	Price     int       `json:"price"`
	ImagePath string    `json:"imagePath"`
	Labels    string    `json:"labels"` // カンマ区切りのラベル（例: "新商品,人気,セール"）
	UserID    uint      `json:"userId"`
	User      User      `json:"user"`
}
