package handlers

import (
	"net/http"
	"orderbase/models"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ShowDashboard(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user")
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"username": user})
}

// DashboardStats ダッシュボード統計情報のレスポンス
type DashboardStats struct {
	TodaySales         int                  `json:"today_sales"`
	MonthSales         int                  `json:"month_sales"`
	YearSales          int                  `json:"year_sales"`
	TotalSales         int                  `json:"total_sales"`
	TodayOrders        int64                `json:"today_orders"`
	MonthOrders        int64                `json:"month_orders"`
	YearOrders         int64                `json:"year_orders"`
	TotalOrders        int64                `json:"total_orders"`
	PendingOrders      int64                `json:"pending_orders"`
	CompletedOrders    int64                `json:"completed_orders"`
	CancelledOrders    int64                `json:"cancelled_orders"`
	TopProducts        []ProductStats       `json:"top_products"`
	RecentOrders       []models.Order       `json:"recent_orders"`
}

// ProductStats 商品別統計
type ProductStats struct {
	ProductID    uint   `json:"product_id"`
	ProductName  string `json:"product_name"`
	ProductImage string `json:"product_image"`
	TotalSold    int64  `json:"total_sold"`
	TotalRevenue int    `json:"total_revenue"`
}

// GetDashboardStats ダッシュボード統計情報を取得
func GetDashboardStats(c *gin.Context, db *gorm.DB) {
	session := sessions.Default(c)
	userID := session.Get("user_id")
	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ログインが必要です"})
		return
	}

	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	startOfYear := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())

	var stats DashboardStats

	// 今日の売上と注文数
	db.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", startOfToday, "completed").
		Select("COALESCE(SUM(total_price), 0) as total_sales, COUNT(*) as total_orders").
		Scan(&struct {
			TotalSales  int   `gorm:"column:total_sales"`
			TotalOrders int64 `gorm:"column:total_orders"`
		}{TotalSales: stats.TodaySales, TotalOrders: stats.TodayOrders})

	db.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", startOfToday, "completed").
		Count(&stats.TodayOrders)

	db.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", startOfToday, "completed").
		Select("COALESCE(SUM(total_price), 0)").
		Scan(&stats.TodaySales)

	// 今月の売上と注文数
	db.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", startOfMonth, "completed").
		Count(&stats.MonthOrders)

	db.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", startOfMonth, "completed").
		Select("COALESCE(SUM(total_price), 0)").
		Scan(&stats.MonthSales)

	// 今年の売上と注文数
	db.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", startOfYear, "completed").
		Count(&stats.YearOrders)

	db.Model(&models.Order{}).
		Where("created_at >= ? AND status = ?", startOfYear, "completed").
		Select("COALESCE(SUM(total_price), 0)").
		Scan(&stats.YearSales)

	// 全体の売上と注文数
	db.Model(&models.Order{}).
		Where("status = ?", "completed").
		Count(&stats.TotalOrders)

	db.Model(&models.Order{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(total_price), 0)").
		Scan(&stats.TotalSales)

	// ステータス別注文数
	db.Model(&models.Order{}).Where("status = ?", "pending").Count(&stats.PendingOrders)
	db.Model(&models.Order{}).Where("status = ?", "completed").Count(&stats.CompletedOrders)
	db.Model(&models.Order{}).Where("status = ?", "cancelled").Count(&stats.CancelledOrders)

	// 人気商品トップ5
	db.Model(&models.Order{}).
		Select("product_id, SUM(quantity) as total_sold, SUM(total_price) as total_revenue").
		Where("status = ?", "completed").
		Group("product_id").
		Order("total_sold DESC").
		Limit(5).
		Scan(&stats.TopProducts)

	// 商品名と画像を取得
	for i := range stats.TopProducts {
		var product models.Product
		if err := db.First(&product, stats.TopProducts[i].ProductID).Error; err == nil {
			stats.TopProducts[i].ProductName = product.Name
			stats.TopProducts[i].ProductImage = product.ImagePath
		}
	}

	// 最近の注文10件
	db.Preload("Product").
		Preload("User").
		Order("created_at DESC").
		Limit(10).
		Find(&stats.RecentOrders)

	c.JSON(http.StatusOK, stats)
}
