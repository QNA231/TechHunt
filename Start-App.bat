@echo off
title TechHunter Server
cd /d "%~dp0"

echo ============================================================
echo         TECHHUNTER - SAN DO CONG NGHE & LINH KIEN CU
echo ============================================================
echo.
echo [*] Giai phong cong 3000 neu co tien trinh cu dang chay...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Dang mo trinh duyet tai: http://localhost:3000
start "" http://localhost:3000

echo [*] Dang khoi dong may chu Web Server...
echo.
echo (De dung ung dung, ban chi can dong cua so nay lai)
echo ============================================================
echo.

node src/server.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] May chu gap loi khi khoi chay.
    pause
)
