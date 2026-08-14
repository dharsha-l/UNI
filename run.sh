#!/usr/bin/env bash
# ==============================================================================
# InspectAI - Enterprise One-Click Launcher for macOS & Linux
# Auto-provisions PostgreSQL, Python AI, Spring Boot & React Stack
# ==============================================================================

set -e

# Colors for terminal output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}   🚀 Starting InspectAI Enterprise Microservices Stack               ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Navigate to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Portable command check helper
command_exists() {
    command -v "$1" &> /dev/null
}

# ------------------------------------------------------------------------------
# Helper Function: Free port if in use
# ------------------------------------------------------------------------------
free_port() {
    local port=$1
    local pids
    pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}🧹 Clearing port $port (Killing existing process PID $pids)...${NC}"
        kill -9 $pids 2>/dev/null || true
        sleep 1
    fi
}

echo -e "\n${YELLOW}[1/6] Checking and freeing ports (8000, 8081, 8080, 5173)...${NC}"
free_port 8000
free_port 8081
free_port 8080
free_port 5173
echo -e "${GREEN}✓ All ports cleared and ready.${NC}"

# ------------------------------------------------------------------------------
# 1. Environment & Secrets Check (.env)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/6] Verifying environment configuration (.env)...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📄 Creating default .env file from .env.example...${NC}"
    cp .env.example .env 2>/dev/null || touch .env
fi

# Ensure DB credentials exist in .env without overwriting existing keys
if ! grep -q "^DB_USER=" .env; then
    echo "DB_USER=inspectai" >> .env
fi

if ! grep -q "^DB_PASSWORD=" .env; then
    echo "DB_PASSWORD=inspectai_dev_pass" >> .env
fi

if ! grep -q "^DB_NAME=" .env; then
    echo "DB_NAME=inspectai" >> .env
fi

# Load variables safely from .env for script execution
set -a
[ -f .env ] && . .env
set +a

DB_USER="${DB_USER:-inspectai}"
DB_PASS="${DB_PASSWORD:-inspectai_dev_pass}"
DB_NAME="${DB_NAME:-inspectai}"

echo -e "${GREEN}✓ Environment configuration loaded.${NC}"

# ------------------------------------------------------------------------------
# 2. Automated PostgreSQL Check, Install & Provisioning
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/6] Checking & provisioning PostgreSQL database...${NC}"

if ! command_exists psql; then
    echo -e "${YELLOW}📦 PostgreSQL client (psql) not found. Installing PostgreSQL...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            echo -e "${YELLOW}🍺 Installing PostgreSQL@16 via Homebrew...${NC}"
            brew install postgresql@16
            brew services start postgresql@16 || brew services start postgresql || true
        else
            echo -e "${RED}❌ Homebrew is required on macOS to auto-install PostgreSQL. Please install brew or PostgreSQL manually.${NC}"
            exit 1
        fi
    elif [ -f /etc/debian_version ] || command_exists apt; then
        echo -e "${YELLOW}🐧 Installing PostgreSQL via apt...${NC}"
        sudo apt update && sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql && sudo systemctl enable postgresql
    else
        echo -e "${RED}❌ Please install PostgreSQL manually on your system.${NC}"
        exit 1
    fi
else
    # If psql is installed, make sure service is running on macOS/Linux
    if [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
        brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null || true
    elif command_exists systemctl; then
        sudo systemctl start postgresql 2>/dev/null || true
    fi
fi

# Auto-provision Database & Role non-interactively using PGPASSWORD
export PGPASSWORD="${DB_SUPERUSER_PASSWORD:-postgres}"

# Determine psql superuser command
PSQL_CMD="psql -U postgres -h localhost"
if ! psql -U postgres -h localhost -c "SELECT 1;" &>/dev/null; then
    if psql postgres -c "SELECT 1;" &>/dev/null; then
        PSQL_CMD="psql postgres"
    elif psql -c "SELECT 1;" &>/dev/null; then
        PSQL_CMD="psql"
    fi
fi

echo -e "${YELLOW}⚙️ Auto-provisioning database '${DB_NAME}' and user '${DB_USER}'...${NC}"

# Idempotent role creation
$PSQL_CMD -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null | grep -q 1 || \
$PSQL_CMD -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';" 2>/dev/null || true

# Idempotent database creation
$PSQL_CMD -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null | grep -q 1 || \
$PSQL_CMD -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || true

# Grant privileges
$PSQL_CMD -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" 2>/dev/null || true

unset PGPASSWORD

echo -e "${GREEN}✅ PostgreSQL ready: database '${DB_NAME}' provisioned.${NC}"

# ------------------------------------------------------------------------------
# 3. Check & Install Node.js & Frontend Dependencies
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/6] Checking Node.js & Frontend dependencies...${NC}"
if ! command_exists node; then
    echo -e "${YELLOW}📦 Node.js not found. Attempting installation...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
        brew install node
    elif command_exists apt; then
        sudo apt update && sudo apt install -y nodejs npm
    else
        echo -e "${RED}❌ Error: Node.js is not installed. Please install Node.js from https://nodejs.org${NC}"
        exit 1
    fi
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    (cd frontend && npm install)
fi
echo -e "${GREEN}✓ Node.js & Frontend dependencies ready.${NC}"

# ------------------------------------------------------------------------------
# 4. Check & Install Python FastAPI AI Dependencies
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/6] Checking Python 3 & AI Microservice dependencies...${NC}"
if ! command_exists python3; then
    echo -e "${YELLOW}📦 Python 3 not found. Attempting installation...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
        brew install python@3.11
    elif command_exists apt; then
        sudo apt update && sudo apt install -y python3 python3-venv python3-pip
    else
        echo -e "${RED}❌ Error: Python 3 is not installed. Please install Python 3 from https://python.org${NC}"
        exit 1
    fi
fi

# Check & Install Poppler for PDF image conversion
if ! command_exists pdftoppm; then
    echo -e "${YELLOW}📦 Poppler utility (pdftoppm) not found. Installing poppler...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
        brew install poppler
    elif command_exists apt; then
        sudo apt update && sudo apt install -y poppler-utils
    fi
fi

echo -e "${YELLOW}🐍 Installing Python AI requirements...${NC}"
./venv/bin/pip install -q -r requirements.txt
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓ Python FastAPI AI service dependencies ready.${NC}"

# ------------------------------------------------------------------------------
# 5. Check Java & Maven for Spring Boot
# ------------------------------------------------------------------------------
if ! command_exists java; then
    echo -e "${YELLOW}📦 Java 21 not found. Attempting installation...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
        brew install openjdk@21
    elif command_exists apt; then
        sudo apt update && sudo apt install -y openjdk-21-jdk
    else
        echo -e "${RED}❌ Error: Java is not installed. Please install JDK 21 from https://adoptium.net${NC}"
        exit 1
    fi
fi

MAVEN_CMD="mvn"
if ! command_exists mvn; then
    if [ -f "./mvnw" ]; then
        MAVEN_CMD="./mvnw"
    else
        echo -e "${YELLOW}📦 Installing Maven...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]] && command_exists brew; then
            brew install maven
        elif command_exists apt; then
            sudo apt update && sudo apt install -y maven
        else
            echo -e "${RED}❌ Error: Maven is not installed. Please install Maven.${NC}"
            exit 1
        fi
    fi
fi
echo -e "${GREEN}✓ Java & Maven ready.${NC}"

# ------------------------------------------------------------------------------
# 6. Launch All 4 Microservices Concurrently
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[6/6] Launching Microservices...${NC}"

PIDS=()

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down all InspectAI microservices...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    echo -e "${GREEN}✓ All services stopped successfully.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Python FastAPI AI Service (Port 8000)
echo -e "${BLUE}▶ Starting AI Microservice (FastAPI - Port 8000)...${NC}"
(cd ai-service && ./venv/bin/uvicorn main:app --port 8000 --reload) &
PIDS+=($!)

# 2. Start Spring Boot Core Backend (Port 8081)
echo -e "${BLUE}▶ Starting Core Backend (Spring Boot Java 21 / PostgreSQL - Port 8081)...${NC}"
(cd core-backend && $MAVEN_CMD spring-boot:run) &
PIDS+=($!)

# 3. Start Spring Cloud Gateway (Port 8080)
echo -e "${BLUE}▶ Starting API Gateway (Spring Cloud Gateway - Port 8080)...${NC}"
(cd gateway && $MAVEN_CMD spring-boot:run) &
PIDS+=($!)

# 4. Start React Frontend (Port 5173)
echo -e "${BLUE}▶ Starting Frontend App (React + Vite - Port 5173)...${NC}"
(cd frontend && npm run dev) &
PIDS+=($!)

sleep 4
echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN} 🎉 InspectAI is Live & Ready (Native PostgreSQL Integration)!       ${NC}"
echo -e "${GREEN}                                                                      ${NC}"
echo -e "${GREEN} 🌐 Frontend App:      http://localhost:5173                           ${NC}"
echo -e "${GREEN} 🌐 API Gateway:       http://localhost:8080                           ${NC}"
echo -e "${GREEN} 🌐 Spring Boot Core:  http://localhost:8081                           ${NC}"
echo -e "${GREEN} 🌐 FastAPI AI Docs:   http://localhost:8000/docs                      ${NC}"
echo -e "${GREEN} 🐘 Database:          PostgreSQL 'inspectai' @ localhost:5432        ${NC}"
echo -e "${GREEN}                                                                      ${NC}"
echo -e "${GREEN} 🔐 Login: inspector@demo.com / inspector123                          ${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "${YELLOW}Press CTRL+C anytime to stop all services.${NC}\n"

if command_exists open; then
    open http://localhost:5173
elif command_exists xdg-open; then
    xdg-open http://localhost:5173
fi

wait
