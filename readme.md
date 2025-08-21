# 应用简介
本应用是一个前后端分离的项目，实现了一个简单的待办事项列表 to do list

## 技术
后端使用gin, gorm, sqlite3
前端使用react

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
go mod init todo_back
go mod tidy
go build
```
如果是windows系统，会生成todo_back.exe文件，直接双击即可运行

2. 运行前端
cd 进入目录
依次运行以下命令
```sh
pnpm i
pnpm i axios
pnpm i tailwindcss @tailwindcss/vite
```

3. 打开本地网址`http://localhost:5173/`

