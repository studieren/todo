package main

import (
	"net/http"
	"time"

	docs "todo_back/docs"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// @title Todo API
// @version 1.0
// @description 一个简单的待办事项管理接口，用于创建、读取、更新和删除任务。 文档网址：http://127.0.0.1:1111/swagger/index.html
// @termsOfService http://example.com/terms/

// @contact.name API Support
// @contact.url http://example.com/support
// @contact.email support@example.com

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:1111
// @BasePath /api/v1
// @schemes http

// @x-logo {"url": "http://example.com/logo.png", "backgroundColor": "#FFFFFF", "altText": "Todo API Logo"}

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

var db *gorm.DB

//go:generate swag init -g main.go --parseDependency --parseInternal
func main() {
	// Initialize database connection
	initDB()

	// Create Gin router
	r := gin.Default()

	// Configure CORS
	// r.Use(cors.New(cors.Config{
	// 	AllowOrigins:     []string{"http://localhost:5173"}, // 与前端端口完全一致
	// 	AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
	// 	AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
	// 	ExposeHeaders:    []string{"Content-Length"},
	// 	AllowCredentials: true,
	// 	MaxAge:           12 * time.Hour, // 增加预检缓存时间，减少 OPTIONS 请求次数
	// }))
	r.Use(cors.Default())

	api_str := "/api/v1"
	// Configure Swagger
	docs.SwaggerInfo.BasePath = api_str

	// API routes
	v1 := r.Group(api_str)
	{
		todos := v1.Group("/todos")
		{
			todos.GET("/", getTodos)         // List all todos
			todos.GET("/:id", getTodo)       // Get a single todo
			todos.POST("/", createTodo)      // Create a new todo
			todos.PUT("/:id", updateTodo)    // Update a todo
			todos.DELETE("/:id", deleteTodo) // Delete a todo
		}
	}
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// Start server
	r.Run(":1111")
}

// initDB initializes the database connection
func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("todos.db"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	// Migrate database schema
	db.AutoMigrate(&Todo{})
}

// GetTodos 获取所有的待办事项
// @Summary 列出所有待办事项
// @Description 从数据库中检索所有待办事项的列表。
// @Tags todos
// @Accept json
// @Produce json
// @Success 200 {array} Todo "List of todo items"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /todos [get]
func getTodos(c *gin.Context) {
	var todos []Todo

	// 添加 where 条件，只查询 DeletedAt 为空的记录
	db.Where("deleted_at IS NULL").Find(&todos)

	c.JSON(http.StatusOK, todos)
}

// GetTodo retrieves a single todo item by ID
// @Summary Get a todo item
// @Description Retrieves details of a specific todo item by its ID.
// @Tags todos
// @Accept json
// @Produce json
// @Param id path int true "Todo ID" minimum(1)
// @Success 200 {object} Todo "Todo item details"
// @Failure 404 {object} map[string]string "Todo not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /todos/{id} [get]
func getTodo(c *gin.Context) {
	var todo Todo
	id := c.Param("id")

	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	c.JSON(http.StatusOK, todo)
}

// CreateTodo creates a new todo item
// @Summary Create a new todo item
// @Description Adds a new todo item to the database.
// @Tags todos
// @Accept json
// @Produce json
// @Param todo body Todo true "Todo item to create"
// @Success 201 {object} Todo "Created todo item"
// @Failure 400 {object} map[string]string "Invalid request payload"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /todos [post]
func createTodo(c *gin.Context) {
	var todo Todo
	if err := c.ShouldBindJSON(&todo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&todo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, todo)
}

// UpdateTodo updates an existing todo item
// @Summary Update a todo item
// @Description Updates the details of a specific todo item by its ID.
// @Tags todos
// @Accept json
// @Produce json
// @Param id path int true "Todo ID" minimum(1)
// @Param todo body Todo true "Updated todo item"
// @Success 200 {object} Todo "Updated todo item"
// @Failure 400 {object} map[string]string "Invalid request payload"
// @Failure 404 {object} map[string]string "Todo not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /todos/{id} [put]
func updateTodo(c *gin.Context) {
	var todo Todo
	id := c.Param("id")

	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	if err := c.ShouldBindJSON(&todo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Save(&todo)
	c.JSON(http.StatusOK, todo)
}

// DeleteTodo deletes a todo item
// @Summary Delete a todo item
// @Description Deletes a specific todo item by its ID.
// @Tags todos
// @Accept json
// @Produce json
// @Param id path int true "Todo ID" minimum(1)
// @Success 200 {object} map[string]string "Todo deleted successfully"
// @Failure 404 {object} map[string]string "Todo not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /todos/{id} [delete]
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
