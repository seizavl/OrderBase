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
	UserID    uint      `json:"userId"`
	User      User      `json:"user"`
}
