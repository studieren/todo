# 应用简介
本应用是一个前后端分离的项目，实现了一个简单的待办事项列表 to do list

## 项目效果预览图
![alt text](image.png)

## 技术栈
后端使用gin, gorm, sqlite3
### 后端
- 框架: Gin
- ORM: GORM
- 数据库: SQLite3 (轻量级，方便本地开发)
- API 文档: Swaggo (自动生成 Swagger 文档)

### 前端
- 框架: React
- UI 库: Tailwind CSS
- HTTP 客户端: Axios
- 构建工具: Vite

## 后端依赖
- `github.com/gin-contrib/cors v1.7.6`
- `github.com/gin-gonic/gin v1.10.1`
- `github.com/swaggo/files v1.0.1`
- `github.com/swaggo/gin-swagger v1.6.0`
- `github.com/swaggo/swag v1.16.6`
- `gorm.io/driver/sqlite v1.6.0`
- `gorm.io/gorm v1.30.1`

## 前端依赖
- axios
- tailwindcss
- @tailwindcss/vite
- react-dom

# 使用方法
1. 运行后端
cd 进入目录
依次运行以下命令
```sh
# 初始化 Go 模块 (如果还未初始化)
go mod init todo_back

# 同步并下载所有依赖
go mod tidy

# 启动后端服务
go run .
```
如果是windows系统，使用`go build`，会生成`todo_back.exe`文件，直接双击即可运行
后端网址：`http://localhost:1111`
后端接口文档：`http://localhost:1111/swagger/index.html`

2. 运行前端
cd 进入目录
依次运行以下命令
```sh
# 使用 pnpm 安装依赖
pnpm i
pnpm i axios
pnpm i tailwindcss @tailwindcss/vite

# 启动前端应用
pnpm run dev
```

3. 打开前端网址`http://localhost:5173/`

# 小记
由于需要使用swagger文档，而swagger不支持gorm.Model，只能手动实现gorm.Model，并且重写了软删除。
```go
// BaseModel defines common fields for database models
type BaseModel struct {
	ID        uint       `gorm:"primaryKey" json:"id" swag:"description=Unique identifier for the record,example=1"`
	CreatedAt time.Time  `json:"created_at" swag:"description=Record creation timestamp,example=2025-08-21T14:00:00Z"`
	UpdatedAt time.Time  `json:"updated_at" swag:"description=Record last updated timestamp,example=2025-08-21T14:00:00Z"`
	DeletedAt *time.Time `gorm:"index" json:"deleted_at,omitempty" swag:"description=Record deletion timestamp (null if not deleted),example=null"`
}

// Todo represents a task in the todo list
type Todo struct {
	BaseModel
	Title     string     `json:"title" binding:"required" swag:"description=Title of the todo item,example=Finish project documentation"`
	Completed bool       `json:"completed" swag:"description=Completion status of the todo item,example=false"`
	DueDate   *time.Time `json:"due_date" swag:"description=Optional due date for the todo item,example=2025-12-31T23:59:59Z"`
}

```
**软删除及查询**
```go
func getTodo(c *gin.Context) {
	var todo Todo
	id := c.Param("id")

	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	c.JSON(http.StatusOK, todo)
}

func deleteTodo(c *gin.Context) {
	var todo Todo
	id := c.Param("id")

	// 查找待办事项
	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	// 手动更新 DeletedAt 字段以实现软删除
	now := time.Now()
	todo.DeletedAt = &now

	// 使用 Save 方法更新记录
	if err := db.Save(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to soft delete todo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todo soft deleted successfully"})
}
```
