// models/user.go
package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username     string `gorm:"unique"`
	Password     string
	OpenAIKey    string `gorm:"default:''"`
	MainMenuPage string `gorm:"default:''"` // メインメニューとして使用するHTMLページ名
}
