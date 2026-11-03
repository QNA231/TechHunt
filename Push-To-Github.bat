@echo off
chcp 65001 >nul
title Push TechHunt to GitHub
cd /d "%~dp0"

echo ======================================================================
echo           ĐANG ĐẨY MÃ NGUỒN TECHHUNT LÊN GITHUB (QNA231/TechHunt)
echo ======================================================================
echo.
echo Nhánh hiện tại: main
echo Kho lưu trữ:    https://github.com/QNA231/TechHunt.git
echo.
echo Đang thực hiện: git push -u origin main ...
echo.

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo [THÀNH CÔNG] Toàn bộ mã nguồn và file README đã được đẩy lên GitHub!
) else (
    echo [LƯU Ý] Nếu trình duyệt mở ra cửa sổ đăng nhập GitHub, vui lòng bấm
    echo "Sign in with your browser" hoặc nhập Personal Access Token để xác thực.
)

echo.
pause
