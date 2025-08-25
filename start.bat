@echo off
echo 正在启动后端服务...
start cmd /k "cd todo_back && todo_back.exe"

echo 等待后端服务启动...
timeout /t 3 /nobreak >nul

echo 正在启动前端服务...
start cmd /k "cd todo_front && pnpm run dev"

echo 等待前端服务启动...
timeout /t 5 /nobreak >nul

echo 打开前端页面...
start http://localhost:1115

echo 操作完成！
