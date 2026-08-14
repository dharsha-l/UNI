# 📌 InspectAI — Project Progress & Implementation Tracker (SIH1730)

> **Purpose**: This document tracks completed features, current architecture state, step-by-step roadmap, and change logs for the **InspectAI** project (SIH Problem Statement SIH1730: AI-Driven Inspection of Institutions).  
> **Note for AI Assistants**: Read this file at the start of any new session to immediately pick up project state.

---

## 📅 Current Project State & Summary

- **Project Name**: InspectAI (SIH1730)
- **Git Branch**: `kavin` (`origin/kavin`)
- **Architecture**: Production-Grade Decoupled Enterprise Microservices Architecture
- **Status**: 🟢 Core Microservices Deployed & Running | Step 1 (Hybrid PDF Extraction) & Native PostgreSQL Integration Completed ✅

---

## 🏗️ Production-Grade Enterprise Tech Stack Architecture (2026 Standard)

| Layer / Component | Technology Choice | Architectural Justification & Role |
| :--- | :--- | :--- |
| **Frontend** | **React 19 + TypeScript + Tailwind CSS (Vite)** | Type-safe, high-performance UI for data-heavy inspector command dashboard. |
| **API Gateway** | **Spring Cloud Gateway** | Centralized entry point (Port `8080`) for OAuth2/OIDC JWT validation, rate limiting, and North-South microservice routing. |
| **Core Backend** | **Spring Boot 3 (Java 21)** | Enterprise core service managing institutions, users, inspection workflows, decision audit trail (`@PreAuthorize`), and microservice orchestration. |
| **AI Microservices** | **Python FastAPI (Uvicorn)** | Decoupled ML microservice layer ensuring compute-heavy AI tasks scale and fail independently. |
| **Document AI** | **Gemini 3.6 Flash + pdfplumber + OpenCV/Tesseract** | 3-Tier document extraction pipeline converting digital and scanned SSR PDFs/tables into structured JSON without brittle regex. |
| **Computer Vision** | **YOLOv8 / YOLOv9** | Object detection for infrastructure inspection (fire extinguishers, ramps, lab terminals, structural safety). |
| **RAG Vector Store** | **Qdrant / pgvector (PostgreSQL)** | High-performance vector database storing embeddings for NAAC manuals, AICTE APH clauses, and UGC directives. |
| **Embeddings Model** | **sentence-transformers** | Converts regulatory text snippets into dense vector embeddings for semantic clause matching. |
| **Relational DB** | **PostgreSQL 16 (with JPA/Hibernate)** | ACID-compliant data store for structured entities (`User`, `Institution`, `Inspection`, `Finding`, `Document`), inspector audit logs, and risk scores. |
| **Blob / Object Storage**| **LocalDiskFileStorageService / MinIO** | Self-hostable object storage for raw SSR PDFs, certificates, and infrastructure photographs. |
| **Cache & Queue** | **Redis + RabbitMQ / Kafka** | Redis caching for RAG clause lookups; message queue for async batch document/image processing. |
| **MLOps & Registry** | **MLflow + MinIO + KServe** | Track model versions, hyperparameters, and serve YOLO/embedding models reliably. |
| **Security Hardening** | **OAuth2 JWTs + mTLS + HashiCorp Vault + Trivy** | Short-lived JWTs (15 min), East-West mTLS between Spring Boot & Python, container image vulnerability scanning with Trivy. |
| **Observability** | **Prometheus + Grafana + Loki** | Full-stack metrics, distributed tracing, and centralized logging. |
| **Deployment & CI/CD**| **Docker + Docker Compose / K8s + GitHub Actions** | Containerized deployment for demo and production GitOps deployment. |

---

## 🏛️ Microservices System Flow Diagram

```
React Frontend (Vite/TS/Tailwind - Port 5173)
        │ (JWT Auth / Multipart Upload)
        ▼
Spring Cloud Gateway (Java 21 - Port 8080)
        │
        ├──> Spring Boot Core Backend (Java 21 / PostgreSQL / JPA - Port 8081)
        │     - Auth, Institutions, Inspections, Documents & Audit Trail
        │     - Local Disk Storage (`uploads/`) & PostgreSQL Database (`inspectai`)
        │
        └──> FastAPI AI Microservice (Python 3.14 - Port 8000)
              - 3-Tier Hybrid Extraction: pdfplumber ➔ Gemini 3.6 Flash ➔ OpenCV/Tesseract
              - YOLOv8 Vision Detection (Fire Extinguisher & Safety)
              - Qdrant / pgvector Regulation RAG Engine
```

---

## ✅ Completed Milestones & Implemented Features

### 1. Enterprise Microservice Stack Implementation
- [x] **Spring Boot 3 (Java 21) Core Backend (`core-backend/`)**:
  - `pom.xml`, `application.yml`, `CoreBackendApplication.java`
  - Native PostgreSQL 16 Integration (`org.postgresql:postgresql`, `jdbc:postgresql://localhost:5432/inspectai`)
  - JPA Models (`User`, `Institution`, `Inspection`, `Finding`, `Document`)
  - Repositories (`UserRepository`, `InstitutionRepository`, `InspectionRepository`, `FindingRepository`, `DocumentRepository`)
  - Services (`FileStorageService`, `LocalDiskFileStorageService` saving uploads to `uploads/`)
  - Rest Controllers (`AuthController`, `InstitutionController`, `InspectionController`, `FindingController`, `DocumentController`, `AnalyticsController`)
  - PostgreSQL Data Seeder (`DataSeeder.java`)
- [x] **Python FastAPI AI Microservice (`ai-service/`)**:
  - `main.py`, `requirements.txt`, Python virtualenv
  - 3-Tier Document Text Extraction endpoint (`POST /api/v1/ai/documents/analyze`) via `pdf_extraction.py` (`pdfplumber` ➔ Gemini 3.6 Flash ➔ OpenCV/Tesseract)
  - Vision AI object detection endpoint (`POST /api/v1/ai/images/analyze`)
  - AI Cross-Verification finding generator (`POST /api/v1/ai/cross-verify`)
  - NAAC/AICTE Regulation RAG search (`GET /api/v1/ai/regulations/search`)
- [x] **Spring Cloud Gateway (`gateway/`)**:
  - `pom.xml`, `application.yml`, `GatewayApplication.java`
  - Central routing for `/api/**` endpoints on port `8080` to Core Backend (`8081`) and FastAPI AI (`8000`)
- [x] **React 19 + TypeScript + Tailwind Frontend (`frontend/`)**:
  - 17 application pages (Dashboard, Institutions, Inspections, Document Evidence, YOLO visual detection, Cross-Verification matrix, Evidence Traceability, Regulation search, Reports)
  - Configured `vite.config.ts` proxy to route via Gateway / Spring Boot
  - Live document card rendering with PostgreSQL extracted text preview and extraction method badges

### 2. One-Click Double-Tap Launcher Automation (`run.sh` & `run.bat`)
- [x] **`run.sh` (macOS / Linux)**:
  - Portable dependency check helper (`command_exists()`)
  - Automated PostgreSQL installation (`brew install postgresql@16` / `apt install postgresql`)
  - Poppler utility check (`pdftoppm`)
  - Non-interactive idempotent database & user role provisioning using `PGPASSWORD` (`inspectai` / `inspectai_dev_pass`)
  - Automatic `.env` generation and interactive `GEMINI_API_KEY` prompt helper
  - Automatic port clearing (kills existing processes on ports 8000, 8081, 8080, 5173)
  - Launches all 4 microservices concurrently and opens `http://localhost:5173`
- [x] **`run.bat` (Windows)**:
  - Windows CMD automated launcher with Chocolatey PostgreSQL check (`choco install postgresql16`)
  - Dynamic `.env` credential parsing and non-interactive `set PGPASSWORD` database provisioning
  - Interactive console prompt for missing `GEMINI_API_KEY`
  - Maven wrapper fallback (`mvnw.cmd`)
  - Launches 4 concurrent CMD windows and opens default browser

### 3. Comprehensive Documentation & Research Base
- [x] Research Document: `SIH1730 AI Inspection Analysis.md` (733 lines of feasibility analysis, competitor benchmarks, datasets, regulatory framework, and hackathon MVP strategy)
- [x] `README.md` updated with full setup instructions and native PostgreSQL documentation
- [x] `implementation_plan.md` & `walkthrough.md` in conversation artifacts

---

## 🎯 Prioritized Implementation Roadmap (In Execution Order)

Below is the user-approved, high-payoff execution sequence designed for maximum demo impact and risk reduction:

### 1️⃣ Step 1: Hybrid Real Document Extraction (pdfplumber + Gemini Vision + OpenCV/Tesseract) [COMPLETED ✅]
- [x] **`ai-service/pdf_extraction.py`**: Implemented 3-Tier fallback chain: `pdfplumber` (digital text) ➔ Gemini 3.6 Flash Vision API (`google-genai`) ➔ OpenCV+PyTesseract preprocessed OCR fallback.
- [x] **`POST /api/v1/ai/documents/analyze`**: Updated endpoint in `ai-service/main.py` with temporary file handling, returning `{filename, extracted_text, length, is_text_based, extraction_method, message}`.
- [x] **Security Hardening**: Loaded `GEMINI_API_KEY` securely via `.env` / `python-dotenv`, excluded `.env` in `.gitignore`, and committed `.env.example`.
- [x] **Automated Tests**: Created `test_documents_analyze.py` with 4 `pytest` tests covering text PDFs, multi-page PDFs, Gemini key unsetting, and Gemini Vision mocking (4/4 passing).

### 2️⃣ Step 2: One Working YOLO Detector End-to-End (Fire Extinguisher Focus)
- **Goal**: Implement a narrow, 100% real YOLOv8 object detector specifically targeting Fire Extinguishers in facility photos.
- **Payoff**: Demonstrates solid visual AI verification without overcomplicating multi-class training.

### 3️⃣ Step 3: Stand Up FAISS / Qdrant for Embedded Regulation RAG
- **Goal**: Embed Qdrant / FAISS in FastAPI (`ai-service`) with `sentence-transformers` vector search over NAAC manuals and AICTE APH clauses.
- **Payoff**: Solves the major competitor gap identified in your research paper by delivering regulation-aware citations.

### 4️⃣ Step 4: Evidence Traceability Graph UI (Core Differentiator)
- **Goal**: Build an interactive evidence provenance graph on `FindingDetailPage.tsx` linking:
  $$\text{OCR Extract} \longrightarrow \text{Visual AI Detection} \longrightarrow \text{External Baseline} \longrightarrow \text{Regulation Clause} \longrightarrow \text{Inspector Decision}$$
- **Payoff**: Creates the visual "WOW" factor for hackathon judges by demonstrating transparent, accountable AI auditing.

### 5️⃣ Step 5: Synthetic AISHE/NIRF Data Baseline & Cross-Check Demo
- **Goal**: Seed 2–3 synthetic institution rows mimicking real AISHE/NIRF schemas in Spring Boot to demonstrate discrepancy checking.
- **Payoff**: Proves cross-institutional data verification without waiting for restricted government API feeds.

### 6️⃣ Step 6: PDF Inspection Report Generation (Mechanical - Do Last)
- **Goal**: Add PDF export generation (using ReportLab in Python or PDFBox in Spring Boot) once Finding and Inspector Decision models are finalized.
- **Payoff**: Provides a downloadable, signed audit report for institutional submission.

---

## 📝 Change Log

| Date & Time | Updated Component | Description of Changes |
| :--- | :--- | :--- |
| **Aug 14, 2026** | `SIH1730 AI Inspection Analysis.md` | Created and pushed comprehensive SIH1730 research analysis. |
| **Aug 14, 2026** | Architecture Stack | Migrated from Express TS prototype to Spring Boot (Java 21), Spring Gateway, and Python FastAPI microservices. |
| **Aug 14, 2026** | Launchers (`run.sh` / `run.bat`) | Built one-click double-tap launchers with automatic port clearing (`8000`, `8081`, `8080`, `5173`). |
| **Aug 14, 2026** | Step 1 (`pdfplumber`) | Implemented real digital PDF text extraction with `pytest` unit test suite (3/3 passing). |
| **Aug 14, 2026** | Production Stack Spec | Added 2026 Production-Grade Tech Stack Specification (Docling, Qdrant/pgvector, MLflow, MinIO, OAuth2/mTLS) to `PROJECT_PROGRESS.md`. |
| **Aug 14, 2026** | Gemini Vision API | Integrated Gemini 3.6 Flash Vision API for scanned image PDFs and OpenCV+PyTesseract fallback with explicit logging. |
| **Aug 14, 2026** | Native PostgreSQL | Integrated native PostgreSQL 16 database, JPA `Document` entity, `LocalDiskFileStorageService`, and `DocumentController` / `AnalyticsController` endpoints. |
| **Aug 14, 2026** | Launcher Automation | Added non-interactive `PGPASSWORD` database provisioning, `poppler` utility check, and interactive `.env` key prompt helper to `run.sh` & `run.bat`. |
