@echo off
echo ����������˷���...
start cmd /k "cd todo_back && todo_back.exe"

echo �ȴ���˷�������...
timeout /t 3 /nobreak >nul

echo ��������ǰ�˷���...
start cmd /k "cd todo_front && pnpm run dev"

echo �ȴ�ǰ�˷�������...
timeout /t 5 /nobreak >nul

echo ��ǰ��ҳ��...
start http://localhost:1115

echo ������ɣ�
