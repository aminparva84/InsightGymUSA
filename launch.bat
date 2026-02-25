@echo off
title Insight GYM USA Launcher
color 0A
echo ========================================
echo   Insight GYM USA - Application Launcher
echo ========================================
echo.

REM Change to the script's directory
cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 14 or higher
    pause
    exit /b 1
)

REM Check if backend virtual environment exists - auto-setup if missing
if not exist "backend\venv" (
    echo [INFO] Backend virtual environment not found. Running setup...
    echo.
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    if not exist .env (
        echo Creating .env file...
        if exist "..\.env.example" copy "..\.env.example" .env
    )
    cd ..
    echo.
    echo [OK] Backend setup complete!
    echo.
)

REM Check if frontend node_modules exists - auto-setup if missing
if not exist "frontend\node_modules" (
    echo [INFO] Frontend dependencies not found. Running npm install...
    echo.
    cd frontend
    call npm install
    cd ..
    echo.
    echo [OK] Frontend setup complete!
    echo.
)

REM Ensure frontend .env exists (sets PORT=3001 to avoid port 3000 conflicts)
if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        echo [INFO] Creating frontend .env from .env.example...
        copy "frontend\.env.example" "frontend\.env"
    )
)

echo [INFO] All prerequisites found!
echo.

REM Check if backend is already running
netstat -ano | findstr ":5001" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Backend server may already be running on port 5001
    echo.
)

REM Check if frontend is already running
netstat -ano | findstr ":3001" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Frontend server may already be running on port 3001
    echo.
)

echo [1/2] Starting backend server...
start "Insight GYM USA Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate && echo Backend Server Starting... && python app.py"

REM Wait a moment for backend to initialize
echo [INFO] Waiting for backend to initialize...
timeout /t 2 /nobreak >nul

echo [2/2] Starting frontend server...
start "Insight GYM USA Frontend" cmd /k "cd /d %~dp0frontend && echo Frontend Server Starting... && npm start"

echo.
echo ========================================
echo   Servers are starting in new windows
echo ========================================
echo.
echo Backend API:  http://localhost:5001
echo Frontend UI:  http://localhost:3001
echo.
echo The application will open automatically in your browser.
echo You can close this window - servers will continue running.
echo.
echo To stop servers, close the Backend and Frontend windows.
echo.
pause
