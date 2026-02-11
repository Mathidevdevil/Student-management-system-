@echo off
echo ========================================
echo Restarting Student Management System
echo ========================================
echo.
echo Stopping any running Node.js servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.
echo Starting server...
cd /d "%~dp0"
start "Student Management System Server" cmd /k "npm start"
echo.
echo ========================================
echo Server is starting in a new window!
echo ========================================
echo.
echo You can now login with:
echo - Main Admin: adminmain / admingce
echo - ECE Admin: admin-ece / adminece123
echo - IT Admin: admin-it / adminit123
echo.
pause
