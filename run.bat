@echo off
TITLE InspectAI - Enterprise One-Click Launcher for Windows
:: ==============================================================================
:: InspectAI - One-Click Double-Tap Launcher for Windows
:: ==============================================================================

echo ======================================================================
echo    🚀 Starting InspectAI Enterprise Microservices Stack
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Check Node.js & Frontend Dependencies
echo [1/4] Checking Node.js & Frontend dependencies...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed! Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo 📦 Installing root dependencies...
    call npm install
)

if not exist "frontend\node_modules\" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)
echo ✓ Node.js & Frontend dependencies ready.
echo.

:: 2. Check Python & AI Service Dependencies
echo [2/4] Checking Python & AI Microservice dependencies...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed! Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

cd ai-service
if not exist "venv\" (
    echo 🐍 Creating Python virtual environment (venv)...
    python -m venv venv
)

echo 🐍 Installing Python requirements...
call venv\Scripts\pip.exe install -q -r requirements.txt
cd ..
echo ✓ Python FastAPI AI service dependencies ready.
echo.

:: 3. Check Java & Maven
echo [3/4] Checking Java 21 & Maven...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Java is not installed! Please install JDK 21 from https://adoptium.net
    pause
    exit /b 1
)

where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Maven is not installed! Please install Maven from https://maven.apache.org
    pause
    exit /b 1
)
echo ✓ Java & Maven ready.
echo.

:: 4. Launch Microservices in Concurrent Windows
echo [4/4] Launching Microservices...

echo ▶ Starting AI Microservice (FastAPI - Port 8000)...
start "InspectAI - Python AI Service (Port 8000)" cmd /k "cd ai-service && venv\Scripts\python.exe -m uvicorn main:app --port 8000 --reload"

echo ▶ Starting Core Backend (Spring Boot Java 21 - Port 8081)...
start "InspectAI - Spring Boot Core (Port 8081)" cmd /k "cd core-backend && mvn spring-boot:run"

echo ▶ Starting API Gateway (Spring Cloud Gateway - Port 8080)...
start "InspectAI - Spring Cloud Gateway (Port 8080)" cmd /k "cd gateway && mvn spring-boot:run"

echo ▶ Starting Frontend App (React + Vite - Port 5173)...
start "InspectAI - React Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo  🎉 InspectAI is Live & Running!
echo 
echo  🌐 Frontend App:     http://localhost:5173
echo  🌐 API Gateway:      http://localhost:8080
echo  🌐 Spring Boot Core: http://localhost:8081
echo  🌐 FastAPI AI Docs:  http://localhost:8000/docs
echo 
echo  🔐 Login: inspector@demo.com / inspector123
echo ======================================================================
echo.

timeout /t 5 >nul
start http://localhost:5173
