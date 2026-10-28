@echo off
echo Dang tao loi tat (Shortcut) ra man hinh Desktop...

set "TARGET_DIR=%~dp0"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"

powershell -Command "$wsh = New-Object -ComObject WScript.Shell; $sc = $wsh.CreateShortcut('%DESKTOP_DIR%\Tech Deal Hunter.lnk'); $sc.TargetPath = '%TARGET_DIR%Start-App.bat'; $sc.WorkingDirectory = '%TARGET_DIR%'; $sc.Description = 'Tech Deal Hunter'; $sc.IconLocation = 'shell32.dll,13'; $sc.Save()"

if exist "%DESKTOP_DIR%\Tech Deal Hunter.lnk" (
    echo.
    echo [THANH CONG] Da tao bieu tuong 'Tech Deal Hunter' tren Desktop!
) else (
    echo.
    echo [LUU Y] Ban co the chuot phai vao file Start-App.bat chon 'Send to' - 'Desktop'.
)

echo.
timeout /t 3 >nul
