@echo off
title Beauty Parlour Application
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║          BEAUTY PARLOUR APPLICATION STARTUP                   ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Kill any existing node processes
echo [1/5] Stopping any existing processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
echo       Done.
echo.

REM Check if MongoDB is running
echo [2/5] Checking MongoDB connection...
where mongod >nul 2>&1
if %errorlevel%==0 (
    echo       MongoDB is installed locally.
    REM Check if MongoDB service is running
    sc query MongoDB >nul 2>&1
    if %errorlevel%==0 (
        echo       Starting MongoDB service...
        net start MongoDB 2>nul
    ) else (
        echo       MongoDB service not found. Using connection string from .env
    )
) else (
    echo       Local MongoDB not found. Using Atlas/remote connection from .env
)
echo.

REM Build backend first
echo [3/5] Building Backend...
cd /d "D:\Beauty parlour application\backend"
call npm run build 2>nul
echo       Build complete.
echo.

REM Start Backend
echo [4/5] Starting Backend Server (Port 3000)...
cd /d "D:\Beauty parlour application"
start "BACKEND - Beauty Parlour API" cmd /k "cd backend && npm run start:dev"
echo       Waiting for backend to initialize...
timeout /t 8 /nobreak >nul
echo       Backend starting...
echo.

REM Start Frontend
echo [5/5] Starting Frontend (Port 4200)...
start "FRONTEND - Beauty Parlour App" cmd /k "cd beauty-parlour && ng serve --port 4200 --open"
echo       Frontend starting...
echo.

echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                    STARTUP COMPLETE!                          ║
echo  ╠═══════════════════════════════════════════════════════════════╣
echo  ║  Backend API:    http://localhost:3000/api                    ║
echo  ║  API Docs:       http://localhost:3000/api/docs               ║
echo  ║  Frontend:       http://localhost:4200                        ║
echo  ║  Database:       MongoDB (check .env for connection)          ║
echo  ╠═══════════════════════════════════════════════════════════════╣
echo  ║  TIP: Keep both terminal windows open to run the app.         ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Press any key to exit this launcher...
pause >nul
