# 📌 InspectAI — Project Progress & Implementation Tracker (SIH1730)

> **Purpose**: This document tracks completed features, current architecture state, step-by-step roadmap, and change logs for the **InspectAI** project (SIH Problem Statement SIH1730: AI-Driven Inspection of Institutions).  
> **Note for AI Assistants**: Read this file at the start of any new session to immediately pick up project state.

---

## 📅 Current Project State & Summary

- **Project Name**: InspectAI (SIH1730)
- **Git Branch Parity**: `main`, `kavin`, `bhava`, `kaviya` (All 4 branches kept 100% synchronized)
- **Architecture**: Production-Grade Decoupled Enterprise Microservices Architecture
- **Status**: 🟢 Core Microservices Deployed & Running | Step 1 (Hybrid PDF Extraction) & Step 2 (Live Roboflow RF-DETR Vision AI Model Integration) Fully Completed ✅

---

## 🏗️ Production-Grade Enterprise Tech Stack Architecture

| Layer / Component | Technology Choice | Architectural Justification & Role |
| :--- | :--- | :--- |
| **Frontend** | **React 19 + TypeScript + Tailwind CSS (Vite)** | Type-safe, high-performance UI for data-heavy inspector command dashboard. |
| **API Gateway** | **Spring Cloud Gateway** | Centralized entry point (Port `8080`) for OAuth2/OIDC JWT validation, rate limiting, and North-South microservice routing. |
| **Core Backend** | **Spring Boot 3 (Java 21)** | Enterprise core service managing institutions, users, inspection workflows, decision audit trail (`@PreAuthorize`), and microservice orchestration. |
| **AI Microservices** | **Python FastAPI (Uvicorn)** | Decoupled ML microservice layer ensuring compute-heavy AI tasks scale and fail independently. |
| **Document AI** | **Gemini 3.6 Flash + pdfplumber + OpenCV/Tesseract** | 3-Tier document extraction pipeline converting digital and scanned SSR PDFs/tables into structured JSON without brittle regex. |
| **Computer Vision** | **Roboflow Hosted RF-DETR Model (`inference-sdk`)** | Live object detection for fire safety & campus infrastructure (`camera`, `fire-blanket`, `fire-exit-sign`, `fire-extinguisher`, `smoke-detector`). |
| **RAG Vector Store** | **Qdrant / pgvector (PostgreSQL)** | High-performance vector database storing embeddings for NAAC manuals, AICTE APH clauses, and UGC directives. |
| **Embeddings Model** | **sentence-transformers** | Converts regulatory text snippets into dense vector embeddings for semantic clause matching. |
| **Relational DB** | **PostgreSQL 16 (with JPA/Hibernate)** | ACID-compliant data store for structured entities (`User`, `Institution`, `Inspection`, `Finding`, `Document`), inspector audit logs, and risk scores. |
| **Blob / Object Storage**| **LocalDiskFileStorageService / MinIO** | Self-hostable object storage for raw SSR PDFs, certificates, and infrastructure photographs. |
| **Cache & Queue** | **Redis + RabbitMQ / Kafka** | Redis caching for RAG clause lookups; message queue for async batch document/image processing. |
| **MLOps & Registry** | **MLflow + MinIO + KServe** | Track model versions, hyperparameters, and serve YOLO/RF-DETR embedding models reliably. |
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
        └──> FastAPI AI Microservice (Python 3.11/3.14 - Port 8000)
              - 3-Tier Hybrid Document Extraction: pdfplumber ➔ Gemini 3.6 Flash ➔ OpenCV/Tesseract
              - Live Roboflow Hosted RF-DETR Vision AI (`inference-sdk`)
              - Qdrant / pgvector Regulation RAG Engine
```

---

## ✅ Completed Milestones & Implemented Features

### 1. Enterprise Microservice Stack Implementation
- [x] **Spring Boot 3 (Java 21) Core Backend (`core-backend/`)**:
  - `pom.xml`, `application.yml`, `CoreBackendApplication.java`
  - Native PostgreSQL 16 Integration (`org.postgresql:postgresql`, `jdbc:postgresql://localhost:5432/inspectai`)
  - JPA Models (`User`, `Institution`, `Inspection`, `Finding`, `Document`)
  - Dynamic Demo Role Provisioning in `AuthController.java` (`INSPECTOR`, `INSPECTION_ADMIN`, `INSTITUTION_ADMIN`)
  - PostgreSQL Data Seeder (`DataSeeder.java`)
- [x] **Python FastAPI AI Microservice (`ai-service/`)**:
  - `main.py`, `requirements.txt`, Python virtualenv
  - 3-Tier Document Text Extraction endpoint (`POST /api/v1/ai/documents/analyze`) via `pdf_extraction.py` (`pdfplumber` ➔ Gemini 3.6 Flash ➔ OpenCV/Tesseract)
  - Live Roboflow Hosted RF-DETR Vision AI endpoint (`POST /api/v1/ai/images/analyze`) via `roboflow_client.py` using `inference-sdk`
  - 15/15 passing `pytest` unit test suite (`test_documents_analyze.py`, `test_roboflow_api.py`, `test_yolo_api.py`, `test_yolo_detection.py`)
- [x] **Spring Cloud Gateway (`gateway/`)**:
  - Central routing for `/api/**` endpoints on port `8080` to Core Backend (`8081`) and FastAPI AI (`8000`)
- [x] **React 19 + TypeScript + Tailwind Frontend (`frontend/`)**:
  - 17 application pages (Dashboard, Institutions, Inspections, Document Evidence, YOLO visual detection, Cross-Verification matrix, Evidence Traceability, Regulation search, Reports)
  - Visual Evidence page (`VisualEvidencePage.tsx`) with real photo rendering, object preview URLs, automatic live Roboflow AI execution on drop, precision bounding box overlays, and detection count summaries.

### 2. Live Roboflow RF-DETR Object Detection Integration (Step 2 Completed ✅)
- [x] Integrated `inference-sdk` into `ai-service/requirements.txt` & `roboflow_client.py`.
- [x] Workspace: `civicissue-irb9x` | Model ID: `uni2-l8vuj/1` | Workflow ID: `uni2-vuni2-l8vuj-1-rfdetr-medium-t1-logic`.
- [x] Configured secure credentials in `ai-service/.env` & `.env` (`ROBOFLOW_API_KEY=W0iRZTQuPFKiR8l7CH6p`).
- [x] Restricted all detection classes strictly to the 5 Roboflow model classes:
  1. `camera`
  2. `fire-blanket`
  3. `fire-exit-sign`
  4. `fire-extinguisher`
  5. `smoke-detector`
- [x] Automatic coordinate conversion: Converts Roboflow `(x, y, width, height)` center coordinates to top-left percentages (`0-100%`) using PIL image dimension extraction.
- [x] Photo-relative overlay wrapping (`<div className="relative inline-block">`) ensuring bounding boxes render 100% accurately over physical objects in photos.
- [x] Automatic AI analysis execution immediately upon image drop/upload.

### 3. One-Click Double-Tap Launcher Automation (`run.sh` & `run.bat`)
- [x] **`run.sh` (macOS / Linux)** & **`run.bat` (Windows)**: Non-interactive database setup, port clearing (8000, 8081, 8080, 5173), automatic `.env` loading, and multi-process startup.

### 4. Git Branch Synchronization
- [x] Synchronized `main`, `kavin`, `bhava`, and `kaviya` local and remote branches to 100% identical commit state.

---

## 🎯 Prioritized Implementation Roadmap (In Execution Order)

### 1️⃣ Step 1: Hybrid Real Document Extraction (pdfplumber + Gemini Vision + OpenCV/Tesseract) [COMPLETED ✅]
- Implemented 3-tier fallback chain for SSR PDFs with `pytest` unit test coverage.

### 2️⃣ Step 2: Roboflow Hosted RF-DETR Vision AI Model Integration [COMPLETED ✅]
- Connected live Roboflow model `uni2-l8vuj/1` via `inference-sdk`, with automatic coordinate normalization and precision photo overlays.

### 3️⃣ Step 3: Stand Up Qdrant / pgvector for Embedded Regulation RAG (Next Step 🔜)
- **Goal**: Embed vector search in FastAPI (`ai-service`) with `sentence-transformers` over NAAC manuals and AICTE APH clauses.
- **Payoff**: Solves regulatory citations by returning exact clause references for non-compliance findings.

### 4️⃣ Step 4: Evidence Traceability Graph UI (Core Differentiator)
- **Goal**: Interactive evidence provenance graph on `FindingDetailPage.tsx` linking:
  $$\text{OCR Extract} \longrightarrow \text{Visual AI Detection} \longrightarrow \text{External Baseline} \longrightarrow \text{Regulation Clause} \longrightarrow \text{Inspector Decision}$$

### 5️⃣ Step 5: Synthetic AISHE/NIRF Data Baseline & Cross-Check Demo
- **Goal**: Seed synthetic institution rows mimicking real AISHE/NIRF schemas in Spring Boot for institutional baseline verification.

### 6️⃣ Step 6: PDF Inspection Report Generation (Do Last)
- **Goal**: Automated signed PDF report generation for NAAC/AICTE institutional audit submission.

---

## 📝 Change Log

| Date & Time | Updated Component | Description of Changes |
| :--- | :--- | :--- |
| **Aug 17, 2026** | Roboflow Live API | Integrated live Roboflow hosted model `uni2-l8vuj/1` using `inference-sdk` & key `W0iRZTQuPFKiR8l7CH6p`. |
| **Aug 17, 2026** | Visual Evidence UI | Added automatic live Roboflow AI execution on image upload and photo-relative inline box positioning in `VisualEvidencePage.tsx`. |
| **Aug 17, 2026** | Roboflow Normalization | Added PIL dimension extraction & center-to-corner percentage bounding box coordinate conversion in `roboflow_client.py`. |
| **Aug 17, 2026** | Model Class Alignment | Restricted 100% of detection classes across frontend & backend strictly to the 5 Roboflow model classes (`camera`, `fire-blanket`, `fire-exit-sign`, `fire-extinguisher`, `smoke-detector`). |
| **Aug 17, 2026** | Core Auth & Images | Updated Spring Boot `AuthController` for demo role auto-provisioning and `/api/images/analyze-all/:id` re-analysis. |
| **Aug 17, 2026** | Multi-Branch Sync | Synchronized `main`, `kavin`, `bhava`, and `kaviya` git branches on local and GitHub remote. |
