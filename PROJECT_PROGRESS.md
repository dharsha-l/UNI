# 📌 InspectAI — Project Progress & Implementation Tracker (SIH1730)

> **Purpose**: This document tracks completed features, current architecture state, step-by-step roadmap, and change logs for the **InspectAI** project (SIH Problem Statement SIH1730: AI-Driven Inspection of Institutions).  
> **Note for AI Assistants**: Read this file at the start of any new session to immediately pick up project state.

---

## 📅 Current Project State & Summary

- **Project Name**: InspectAI (SIH1730)
- **Git Branch**: `kavin` (`origin/kavin`)
- **Architecture**: Decoupled Enterprise Microservices Architecture (Spring Boot + Spring Cloud Gateway + Python FastAPI + React TypeScript Frontend)
- **Status**: 🟢 Core Microservice Architecture Fully Deployed & Running (Waiting for user confirmation to start implementation phase)

---

## 🏗️ Architecture Stack Overview

```
React Frontend (Vite/TS/Tailwind - Port 5173)
        │
        ▼
Spring Cloud Gateway (Java 21 - Port 8080)
        │
        ├──> Spring Boot Core Backend (Java 21 / JPA / H2 - Port 8081)
        │     - Auth, Institutions, Inspections, Findings, Decisions & Reports
        │
        └──> FastAPI AI Microservice (Python 3.14 - Port 8000)
              - OCR Claim Extraction, Vision CV Detection, Cross-Verification & Regulation RAG
```

---

## ✅ Completed Milestones & Implemented Features

### 1. Enterprise Microservice Stack Implementation
- [x] **Spring Boot 3 (Java 21) Core Backend (`core-backend/`)**:
  - `pom.xml`, `application.yml`, `CoreBackendApplication.java`
  - JPA Models (`User`, `Institution`, `Inspection`, `Finding`)
  - Repositories (`UserRepository`, `InstitutionRepository`, `InspectionRepository`, `FindingRepository`)
  - Rest Controllers (`AuthController`, `InstitutionController`, `InspectionController`, `FindingController`)
  - In-Memory Data Seeder (`DataSeeder.java`)
- [x] **Python FastAPI AI Microservice (`ai-service/`)**:
  - `main.py`, `requirements.txt`, Python virtualenv
  - OCR claims extraction endpoint (`POST /api/v1/ai/documents/analyze`)
  - Vision AI object detection endpoint (`POST /api/v1/ai/images/analyze`)
  - AI Cross-Verification finding generator (`POST /api/v1/ai/cross-verify`)
  - NAAC/AICTE Regulation RAG search (`GET /api/v1/ai/regulations/search`)
- [x] **Spring Cloud Gateway (`gateway/`)**:
  - `pom.xml`, `application.yml`, `GatewayApplication.java`
  - Central routing for `/api/**` endpoints on port `8080`
- [x] **React 19 + TypeScript + Tailwind Frontend (`frontend/`)**:
  - 17 application pages (Dashboard, Institutions, Inspections, OCR evidence, YOLO visual detection, Cross-Verification matrix, Evidence Traceability, Regulation search, Reports)
  - Configured `vite.config.ts` proxy to route via Gateway / Spring Boot

### 2. One-Click Double-Tap Launcher Automation
- [x] **`run.sh` (macOS / Linux)**:
  - Automatic dependency check (Node.js, Python 3, Java 21, Maven)
  - Automatic port clearing (kills existing processes on ports 8000, 8081, 8080, 5173)
  - Launches all 4 microservices concurrently and opens `http://localhost:5173`
- [x] **`run.bat` (Windows)**:
  - Automatic port clearing on Windows Command Prompt
  - Launches 4 concurrent CMD windows and opens default browser

### 3. Comprehensive Documentation & Research Base
- [x] Research Document: `SIH1730 AI Inspection Analysis.md` (733 lines of feasibility analysis, competitor benchmarks, datasets, regulatory framework, and hackathon MVP strategy)
- [x] `README.md` updated with full setup instructions
- [x] `implementation_plan.md` & `walkthrough.md` in conversation artifacts

---

## 🎯 Prioritized Implementation Roadmap (In Execution Order)

Below is the user-approved, high-payoff execution sequence designed for maximum demo impact and risk reduction:

### 1️⃣ Step 1: Hybrid Real Document Extraction (Gemini Vision + pdfplumber + PyTesseract Backup)
- **Goal**: Upgrade `ai-service/main.py` to use a 3-Tier Hybrid Extraction engine:
  1. **Tier 1 (Digital PDFs)**: Fast, free local text & table extraction via `pdfplumber`/`pypdf`.
  2. **Tier 2 (Scanned PDFs & Complex Layouts)**: Gemini Vision API (`google-genai`) to extract structured claims JSON directly without writing brittle regex.
  3. **Tier 3 (Offline Fallback)**: OpenCV preprocessed PyTesseract (`grayscale` + `thresholding` + `deskew`) as a 100% self-hosted fallback.
- **Payoff**: Solves messy scanned document parsing cleanly while eliminating manual regex rules.

### 2️⃣ Step 2: One Working YOLO Detector End-to-End (Fire Extinguisher Focus)
- **Goal**: Implement a narrow, 100% real YOLOv8 object detector specifically targeting Fire Extinguishers in facility photos.
- **Payoff**: Demonstrates solid visual AI verification without overcomplicating multi-class training.

### 3️⃣ Step 3: Stand Up FAISS / Chroma for Embedded Regulation RAG
- **Goal**: Embed FAISS/Chroma in FastAPI (`ai-service`) with `sentence-transformers` vector search over NAAC manuals and AICTE APH clauses.
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
| **Aug 14, 2026** | Git Tracking | Committed and pushed all changes to branch `origin/kavin`. |
| **Aug 14, 2026** | `PROJECT_PROGRESS.md` | Updated implementation plan to 6-step demo-prioritized sequence. |
