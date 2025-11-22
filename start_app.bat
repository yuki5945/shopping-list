@echo off
echo Starting Shopping Memo App...

:: Get Local IP
for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set IP=%%a

echo.
echo ===================================================
echo  App will be available at: http://%IP%:5173
echo ===================================================
echo.

:: Start Backend
start "Shopping Memo Backend" cmd /k "cd server && node server.js"

:: Start Frontend
start "Shopping Memo Frontend" cmd /k "cd client && npm run dev"

echo Servers started! Do not close the opened windows.
pause
