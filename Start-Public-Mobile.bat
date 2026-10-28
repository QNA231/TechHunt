@echo off
title Tech Deal Hunter - Public Cloudflare Tunnel
cd /d "%~dp0"

echo ============================================================
echo      TECH DEAL HUNTER - CLOUDFLARE PUBLIC TUNNEL
echo ============================================================
echo.
echo [*] Kiem tra server local cong 3000...
netstat -aon | findstr :3000 | findstr LISTENING >nul
if %ERRORLEVEL% NEQ 0 (
    echo [*] Dang khoi dong Web Server truoc...
    start "Tech Deal Hunter Server" cmd /c "node src/server.js"
    timeout /t 2 >nul
)

echo [*] Dang tao duong link HTTPS cong khai qua Cloudflare...
echo [*] Link cong khai (dang https://...trycloudflare.com) se hien thi ben duoi.
echo [*] Ban chi can copy link do gui sang dien thoai la mo duoc ngay!
echo.
echo ============================================================
echo.

cloudflared.exe tunnel --url http://127.0.0.1:3000

pause
