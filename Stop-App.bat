@echo off
title Dung Tech Deal Hunter
echo Dang dung tien trinh Tech Deal Hunter tai cong 3000 va 3001...

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [+] Da dung tien trinh cong 3000 (PID %%a)
)

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [+] Da dung tien trinh cong 3001 (PID %%a)
)

echo Hoan tat! Cua so se tu dong sau 2 giay.
timeout /t 2 >nul
