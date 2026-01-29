package models

import "time"

type HTMLPage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex;not null" json:"name"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
