# InspectAI

**Evidence-driven. AI-assisted. Human-verified.**

A full-stack prototype for AI-driven institutional inspection, built for SIH/hackathon demonstration.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js** 18+ and **npm**
- **Java 21 (JDK 21)** and **Maven** (`mvn`)
- **Python** 3.10+ and **pip**

---

### ⚡ One-Click Double-Tap Launchers (Easiest)

Simply double-click (or run in terminal) the launcher script for your operating system:

#### 🍏 macOS / 🐧 Linux:
```bash
./run.sh
```

#### 🪟 Windows:
Double-click `run.bat` or run in CMD:
```cmd
run.bat
```

> **What the launcher automatically does for you:**
> 1. ✅ Checks for Node.js, Python 3, Java 21, Maven, PostgreSQL 16, and Poppler.
> 2. ✅ Auto-provisions native PostgreSQL database `inspectai` and user `inspectai` non-interactively via `PGPASSWORD`.
> 3. ✅ Generates local `.env` configuration and prompts interactively for missing `GEMINI_API_KEY`.
> 4. ✅ Automatically installs `npm` and `pip` dependencies if missing and sets up `ai-service/venv`.
> 5. ✅ Clears old processes bound to ports `8000`, `8081`, `8080`, and `5173`.
> 6. ✅ Boots up Python FastAPI (`8000`), Spring Boot Core (`8081`), Spring Gateway (`8080`), and React Frontend (`5173`) concurrently.
> 7. ✅ Automatically opens your default web browser to **http://localhost:5173**.

---

### Option 1: Manual Step-by-Step Launch

Run each service in a separate terminal:

#### 1️⃣ AI Microservice (Python FastAPI — Port 8000)
```bash
cd ai-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn main:app --port 8000 --reload
```
*API Docs: **http://localhost:8000/docs***

#### 2️⃣ Core Backend (Spring Boot / Java 21 — Port 8081)
```bash
cd core-backend
mvn spring-boot:run
```
*H2 DB Console: **http://localhost:8081/h2-console***

#### 3️⃣ API Gateway (Spring Cloud Gateway — Port 8080)
```bash
cd gateway
mvn spring-boot:run
```

#### 4️⃣ Frontend Application (React + Vite + TypeScript — Port 5173)
```bash
cd frontend
npm install
npm run dev
```
*App URL: **http://localhost:5173***

---

### Option 2: Run Express Prototype (Single-Command Launch)

If you only want to run the React Frontend and Express Backend without Java/Python:

```bash
npm install
npm run dev
```
*App URL: **http://localhost:5173***

---

## 🔐 Demo Login

| Field | Value |
|-------|-------|
| Email | inspector@demo.com |
| Password | inspector123 |

---

## 🎯 Demo Flow

1. **Login** → `inspector@demo.com` / `inspector123`
2. **Dashboard** → View inspection command center with live stats
3. **Institutions** → Open *ABC Institute of Technology*
4. **Inspections** → Open *INS-2026-001*
5. **Document Evidence** → View uploaded SSR, certificates; click "Run Document Analysis"
6. **Visual Evidence** → View uploaded images; click "Run Visual AI Analysis" (YOLO simulation)
7. **AI Cross-Verification** → Click "Run Cross-Verification" to generate findings
8. **Findings** → Review the 6 AI-generated findings with risk levels
9. **Finding Detail** → Click a finding to see **Evidence Traceability** (most impressive screen)
10. **Inspector Decision** → Click "Accept Finding" or "Override" with reason
11. **Regulations** → Search "barrier-free access" to find relevant NAAC/UGC regulations
12. **Generate Report** → Full inspection report with all findings and decisions

---

## 🏗️ Enterprise Microservice Architecture

```
frontend/             React + Vite + TypeScript + Tailwind CSS (Port 5173)
  src/pages           17 Application Page Modules
  src/services        Axios API Client Layer

gateway/              Spring Cloud Gateway (Port 8080)
  application.yml     Centralized JWT Validation, Rate Limiting & Proxy Routing

core-backend/         Spring Boot (Java 21) Core Backend (Port 8081)
  com.inspectai.core  User Auth, Institutions, Inspections, Findings, Audit Trail & JPA Entities

ai-service/           FastAPI (Python 3.14) AI Microservice (Port 8000)
  main.py             pdfplumber / Docling Document Extraction, YOLOv8 Vision & Qdrant/pgvector RAG
```

---

## 🚀 Production-Grade Tech Stack Specification (2026 Standard)

| Domain | Production Tool Choice | Role & Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Tailwind CSS (Vite) | Type-safe inspector dashboard & interactive traceability graph. |
| **API Gateway** | Spring Cloud Gateway | Centralized OAuth2/OIDC JWT validation, rate limiting, & routing. |
| **Core Backend** | Spring Boot 3 (Java 21) + PostgreSQL | Core business logic, JPA ORM, method security (`@PreAuthorize`), and audit trail. |
| **AI Microservices** | Python FastAPI (Uvicorn) | Decoupled ML microservice layer for Docling, YOLO, and RAG vector search. |
| **Document AI** | Docling (IBM) + pdfplumber | Structured layout parsing for SSR PDFs, tables, and scanned reports. |
| **Computer Vision** | YOLOv8 / YOLOv9 | Infrastructure object detection (fire extinguishers, ramps, seating). |
| **Vector Database** | Qdrant / pgvector (PostgreSQL) | Native hybrid vector search for NAAC, AICTE APH, and UGC regulations. |
| **Object Storage** | MinIO (S3-Compatible) | Self-hostable blob storage for raw PDFs and physical inspection photos. |
| **Security & MLOps** | OAuth2 + mTLS + HashiCorp Vault + Trivy | North-South JWTs, East-West mTLS, MLflow model tracking, and image scanning. |

---

## ⚠️ Important Safety Design

- ❌ AI does **NOT** approve, reject, or accredit institutions
- ✅ AI generates **findings** for inspector review
- ✅ Inspector **accepts or overrides** every AI finding
- ✅ Final decision always belongs to the human inspector
- ✅ Risk score is a support indicator, NOT an accreditation grade
- ✅ Visual evidence treated as partial evidence, not total inventory

---

## 📊 Demo Data

- 4 institutions (ABC, XYZ, NIC, SICE)
- 6 inspections across institutions  
- 6 AI findings for INS-2026-001
- 6 regulation references (NAAC, AICTE, UGC, NIRF)
- External data (AISHE + NIRF) for comparison
- Pre-seeded inspector decisions (accept/override examples)
