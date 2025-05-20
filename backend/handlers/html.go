package handlers

import (
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func SaveHTMLPage(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user")
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未ログイン"})
		return
	}

	pageName := c.Param("page")
	if pageName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ページ名が必要です"})
		return
	}

	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "HTMLの読み込み失敗"})
		return
	}

	os.MkdirAll("static", 0755)
	filePath := filepath.Join("static", pageName+".html")
	err = os.WriteFile(filePath, body, 0644)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイル保存失敗"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "保存成功", "url": "/html/" + pageName + ".html"})
}

func ListHTMLFiles(c *gin.Context) {
	files, err := os.ReadDir("static")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ディレクトリ読み込み失敗"})
		return
	}

	var pages []string
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".html") {
			pages = append(pages, strings.TrimSuffix(f.Name(), ".html"))
		}
	}

	c.JSON(http.StatusOK, gin.H{"pages": pages})
}
