@echo off
setlocal EnableDelayedExpansion
TITLE InspectAI - Enterprise One-Click Launcher for Windows
:: ==============================================================================
:: InspectAI - One-Click Double-Tap Launcher for Windows (Native PostgreSQL)
:: ==============================================================================

echo ======================================================================
echo    🚀 Starting InspectAI Enterprise Microservices Stack
echo ======================================================================
echo.

cd /d "%~dp0"

:: 0. Environment & Secrets Check (.env)
if not exist ".env" (
    echo 📄 Creating default .env file...
    copy .env.example .env >nul 2>&1
)

findstr /C:"DB_USER=" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo DB_USER=inspectai >> .env
)

findstr /C:"DB_PASSWORD=" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo DB_PASSWORD=inspectai_dev_pass >> .env
)

findstr /C:"DB_NAME=" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo DB_NAME=inspectai >> .env
)

findstr /C:"GEMINI_API_KEY=" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo 🔑 GEMINI_API_KEY is missing in .env
    set /p USER_KEY="Enter your Gemini API key (or press Enter to skip): "
    if not "!USER_KEY!"=="" (
        echo GEMINI_API_KEY=!USER_KEY! >> .env
        echo ✓ Saved GEMINI_API_KEY to .env
    ) else (
        echo GEMINI_API_KEY= >> .env
    )
)

:: Set default fallback values
set DB_USER=inspectai
set DB_PASSWORD=inspectai_dev_pass
set DB_NAME=inspectai

:: Read values from .env safely
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="DB_USER" set DB_USER=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
    if "%%a"=="DB_NAME" set DB_NAME=%%b
)

:: 1. Check & Free Ports (8000, 8081, 8080, 5173)
echo [1/6] Clearing ports (8000, 8081, 8080, 5173)...
powershell -Command "Get-NetTCPConnection -LocalPort 8080,8081,8000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
echo ✓ All ports cleared.
echo.

:: 2. Check & Install PostgreSQL Database
echo [2/6] Checking ^& provisioning PostgreSQL database...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" set "PATH=%PATH%;C:\Program Files\PostgreSQL\18\bin"
    if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" set "PATH=%PATH%;C:\Program Files\PostgreSQL\17\bin"
    if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set "PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin"
    if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set "PATH=%PATH%;C:\Program Files\PostgreSQL\15\bin"
    if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" set "PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin"
)

where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ PostgreSQL client ^(psql^) not found!
    where choco >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Chocolatey package manager is missing.
        echo Please install PostgreSQL manually from https://www.postgresql.org/download/windows/
        echo or install Chocolatey ^(https://chocolatey.org^) to enable silent auto-installation.
        echo ⚠️ Skipping PostgreSQL auto-provisioning step.
    ) else (
        echo 🍫 Installing PostgreSQL 16 via Chocolatey...
        choco install postgresql16 --params "/Password:%DB_PASSWORD%" -y
    )
) else (
    :: Auto-provision database non-interactively using PGPASSWORD
    set PGPASSWORD=%DB_PASSWORD%
    echo ⚙️ Auto-provisioning database '%DB_NAME%' and user '%DB_USER%'...

    psql -U postgres -h localhost -c "CREATE USER %DB_USER% WITH ENCRYPTED PASSWORD '%DB_PASSWORD%';" >nul 2>&1
    psql -U postgres -h localhost -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;" >nul 2>&1
    psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;" >nul 2>&1

    set PGPASSWORD=
    echo ✅ PostgreSQL ready: database '%DB_NAME%' provisioned.
)
echo.

:: 3. Check Node.js & Frontend Dependencies
echo [3/6] Checking Node.js ^& Frontend dependencies...
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
echo ✓ Node.js ^& Frontend dependencies ready.
echo.

:: 4. Check Python & AI Service Dependencies
echo [4/6] Checking Python ^& AI Microservice dependencies...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed! Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

cd ai-service
if not exist "venv\" (
    echo 🐍 Creating Python virtual environment ^(venv^)...
    python -m venv venv
)

echo 🐍 Installing Python requirements...
call venv\Scripts\pip.exe install -q -r requirements.txt
cd ..
echo ✓ Python FastAPI AI service dependencies ready.
echo.

:: 5. Check Java & Maven
echo [5/6] Checking Java 21 ^& Maven...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Java is not installed! Please install JDK 21 from https://adoptium.net
    pause
    exit /b 1
)

set MAVEN_CMD=mvn
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    if exist "mvnw.cmd" (
        set MAVEN_CMD=mvnw.cmd
    ) else (
        echo ❌ Error: Maven is not installed! Please install Maven from https://maven.apache.org
        pause
        exit /b 1
    )
)
echo ✓ Java ^& Maven ready ^(%MAVEN_CMD%^).
echo.

:: 6. Launch Microservices in Concurrent Windows
echo [6/6] Launching Microservices...

echo ▶ Starting AI Microservice (FastAPI - Port 8000)...
start "InspectAI - Python AI Service (Port 8000)" cmd /k "cd ai-service && venv\Scripts\python.exe -m uvicorn main:app --port 8000 --reload"

echo ▶ Starting Core Backend (Spring Boot Java 21 / PostgreSQL - Port 8081)...
start "InspectAI - Spring Boot Core (Port 8081)" cmd /k "cd core-backend && %MAVEN_CMD% spring-boot:run"

echo ▶ Starting API Gateway (Spring Cloud Gateway - Port 8080)...
start "InspectAI - Spring Cloud Gateway (Port 8080)" cmd /k "cd gateway && %MAVEN_CMD% spring-boot:run"

echo ▶ Starting Frontend App (React + Vite - Port 5173)...
start "InspectAI - React Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo  🎉 InspectAI is Live ^& Running ^(Native PostgreSQL Integration^)!
echo.
echo  🌐 Frontend App:     http://localhost:5173
echo  🌐 API Gateway:      http://localhost:8080
echo  🌐 Spring Boot Core: http://localhost:8081
echo  🌐 FastAPI AI Docs:  http://localhost:8000/docs
echo  🐘 Database:         PostgreSQL '%DB_NAME%' @ localhost:5432
echo.
echo  🔐 Login: inspector@demo.com / inspector123
echo ======================================================================
echo.

timeout /t 5 >nul 2>&1 || ping -n 6 127.0.0.1 >nul 2>&1
start http://localhost:5173
