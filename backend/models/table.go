package models

import "time"

// Table テーブル（座席）情報
type Table struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TableNumber int       `gorm:"uniqueIndex;not null" json:"table_number"` // 1, 2, 3...
	Capacity    int       `json:"capacity"`                                  // 座席数
	Status      string    `json:"status"`                                    // "active" or "inactive"
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
