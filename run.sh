#!/usr/bin/env bash
# ==============================================================================
# InspectAI - Enterprise One-Click Launcher for macOS & Linux
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

echo -e "\n${YELLOW}[1/5] Checking and freeing ports (8000, 8081, 8080, 5173)...${NC}"
free_port 8000
free_port 8081
free_port 8080
free_port 5173
echo -e "${GREEN}✓ All ports cleared and ready.${NC}"

# ------------------------------------------------------------------------------
# 1. Check & Install Node.js Dependencies
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/5] Checking Node.js & Frontend dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
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
# 2. Check & Install Python FastAPI AI Dependencies
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/5] Checking Python 3 & AI Microservice dependencies...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 is not installed. Please install Python 3.10+ from https://python.org${NC}"
    exit 1
fi

cd "$SCRIPT_DIR/ai-service"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}🐍 Creating Python virtual environment (venv)...${NC}"
    python3 -m venv venv
fi

echo -e "${YELLOW}🐍 Checking Python requirements...${NC}"
./venv/bin/pip install -q -r requirements.txt
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓ Python FastAPI AI service dependencies ready.${NC}"

# ------------------------------------------------------------------------------
# 3. Check Java & Maven for Spring Boot
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/5] Checking Java 21 & Maven for Spring Boot services...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Error: Java is not installed. Please install JDK 21 from https://adoptium.net${NC}"
    exit 1
fi

MAVEN_CMD="mvn"
if ! command -v mvn &> /dev/null; then
    echo -e "${YELLOW}⚠️ Global 'mvn' not found. Checking Maven Wrapper...${NC}"
    if [ -f "./mvnw" ]; then
        MAVEN_CMD="./mvnw"
    else
        echo -e "${RED}❌ Error: Maven is not installed. Please install Maven (brew install maven or https://maven.apache.org)${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Java & Maven ready.${NC}"

# ------------------------------------------------------------------------------
# 4. Launch All 4 Microservices Concurrently
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/5] Launching Microservices...${NC}"

PIDS=()

# Function to stop all background processes on exit
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
echo -e "${BLUE}▶ Starting Core Backend (Spring Boot Java 21 - Port 8081)...${NC}"
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

# Sleep briefly and open browser
sleep 4
echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN} 🎉 InspectAI is Live & Ready!                                       ${NC}"
echo -e "${GREEN}                                                                      ${NC}"
echo -e "${GREEN} 🌐 Frontend App:      http://localhost:5173                           ${NC}"
echo -e "${GREEN} 🌐 API Gateway:       http://localhost:8080                           ${NC}"
echo -e "${GREEN} 🌐 Spring Boot Core:  http://localhost:8081                           ${NC}"
echo -e "${GREEN} 🌐 FastAPI AI Docs:   http://localhost:8000/docs                      ${NC}"
echo -e "${GREEN}                                                                      ${NC}"
echo -e "${GREEN} 🔐 Login: inspector@demo.com / inspector123                          ${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "${YELLOW}Press CTRL+C anytime to stop all services.${NC}\n"

# Auto-open browser
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

# Wait for background services
wait
