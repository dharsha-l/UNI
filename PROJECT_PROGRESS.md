# 📌 InspectAI — Project Progress & Implementation Tracker (SIH1730)

> **Purpose**: This document tracks completed features, current architecture state, step-by-step roadmap, high-fidelity workflow diagrams, and change logs for the **InspectAI** project (SIH Problem Statement SIH1730: AI-Driven Inspection of Institutions).  
> **Note for AI Assistants**: Read this file at the start of any new session to immediately pick up project state.

---

## 📅 Current Project State & Summary

- **Project Name**: InspectAI (SIH1730)
- **Git Branch Parity**: `main`, `kavin`, `bhava`, `kaviya` (All 4 branches kept 100% synchronized)
- **Architecture**: Production-Grade Decoupled Enterprise Microservices Architecture
- **Status**: 🟢 Core Microservices Deployed & Running | Step 1 (Hybrid PDF Extraction), Step 2 (Live Roboflow RF-DETR Vision AI), & Step 3 (Regulation-Aware RAG with PostgreSQL `pgvector` & Inspector Audit Controls) Fully Completed ✅

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
| **Regulation RAG** | **PostgreSQL 16 + pgvector + sentence-transformers** | High-performance vector database storing 384-dimensional embeddings for NAAC manuals, AICTE APH clauses, and UGC directives. |
| **Relational DB** | **PostgreSQL 16 (with JPA/Hibernate)** | ACID-compliant data store for structured entities (`User`, `Institution`, `Inspection`, `Finding`, `Document`), inspector audit logs, and risk scores. |
| **Blob Storage** | **LocalDiskFileStorageService / MinIO** | Self-hostable object storage for raw SSR PDFs, certificates, and infrastructure photographs. |
| **Security Hardening** | **OAuth2 JWTs + mTLS + HashiCorp Vault + Trivy** | Short-lived JWTs, East-West mTLS between Spring Boot & Python, container image vulnerability scanning with Trivy. |

---

## 🔄 Production Workflow Diagrams (Mermaid Architecture & Sequences)

### 1️⃣ Diagram 1: Enterprise Microservices Architecture Diagram

```mermaid
graph TB
    %% Styling & Class Definitions
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    classDef gateway fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#b45309;
    classDef backend fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d;
    classDef ai fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8;
    classDef db fill:#ffe4e6,stroke:#e11d48,stroke-width:2px,color:#be123c;
    classDef cloud fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#3730a3;

    subgraph ClientLayer["🖥️ Frontend Client Layer (Port 5173/5174)"]
        UI["React 19 + Vite Command Dashboard<br/><i>VisualEvidencePage.tsx / DocumentEvidencePage.tsx</i>"]:::client
    end

    subgraph GatewayLayer["🛡️ API Gateway Layer (Port 8080)"]
        Gateway["Spring Cloud Gateway<br/><i>JWT Authentication & Route Dispatcher</i>"]:::gateway
    end

    subgraph BackendLayer["⚙️ Core Backend Layer (Port 8081)"]
        BootCore["Spring Boot 3 Core Backend<br/><i>Auth, Institutions, Inspections, Audit Trail</i>"]:::backend
    end

    subgraph AILayer["⚡ AI Microservice Layer (Port 8000)"]
        FastAPI["Python FastAPI Service<br/><i>Document OCR, Roboflow Client & RAG Engine</i>"]:::ai
        DocEngine["3-Tier PDF Engine<br/><i>pdfplumber ➔ Gemini 3.6 ➔ OpenCV/OCR</i>"]:::ai
        RAGEngine["pgvector RAG Engine<br/><i>sentence-transformers / all-MiniLM-L6-v2</i>"]:::ai
    end

    subgraph PersistenceLayer["🐘 Relational & Vector Persistence Layer (Port 5432)"]
        Postgres[("PostgreSQL 16 Database<br/><i>Relational Tables + pgvector VECTOR(384)</i>")]:::db
    end

    subgraph CloudLayer["☁️ External Cloud Services"]
        RoboflowCloud["Roboflow Cloud RF-DETR Model<br/><i>Model ID: uni2-l8vuj/1</i>"]:::cloud
    end

    %% Network Connections & Flow Routes
    UI -->|1. REST / Multipart Upload| Gateway
    Gateway -->|2. Route /api/**| BootCore
    Gateway -->|3. Route /api/v1/ai/**| FastAPI
    BootCore -->|4. JPA Relational Queries| Postgres
    FastAPI -->|5. 3-Tier PDF Text Extract| DocEngine
    FastAPI -->|6. RAG Vector Search SELECT| RAGEngine
    RAGEngine -->|7. Cosine Distance <=> Search| Postgres
    FastAPI -->|8. HTTP REST Inference| RoboflowCloud
```

---

### 2️⃣ Diagram 2: Complete End-to-End Inspection Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Inspector as 👤 Human Inspector
    participant Web as 🖥️ React Dashboard
    participant Gateway as 🛡️ Spring Gateway
    participant Core as ⚙️ Spring Boot Core
    participant AI as ⚡ FastAPI AI Microservice
    participant Roboflow as ☁️ Roboflow Cloud
    participant DB as 🐘 PostgreSQL (pgvector)

    Inspector->>Web: 1. Uploads Facility Photo & SSR PDF
    Web->>Gateway: 2. POST /api/documents/upload & /api/images/upload
    Gateway->>Core: 3. Dispatch to Core Backend
    Core->>DB: 4. Save Record & Store Image/PDF Buffer
    Core->>AI: 5. POST /api/v1/ai/documents/analyze
    AI-->>Core: 6. Return Extracted Document Claims JSON
    
    Inspector->>Web: 7. Clicks "Run Visual AI Analysis"
    Web->>Gateway: 8. POST /api/images/:id/analyze
    Gateway->>Core: 9. Fetch Image Buffer
    Core->>AI: 10. Forward Image File Buffer to FastAPI
    AI->>Roboflow: 11. Run RF-DETR Model (uni2-l8vuj/1)
    Roboflow-->>AI: 12. Predictions (class: fire-exit-sign, conf: 0.99)
    
    AI->>AI: 13. Map Class to Search Query ("emergency exit sign illumination...")
    AI->>DB: 14. SELECT * FROM regulation_chunks ORDER BY embedding <=> query_vec LIMIT 1
    DB-->>AI: 15. Matched Clause (NAAC Manual Pg 29 Sec 3.8)
    AI-->>Core: 16. Return Detection + Matched Regulation + Status: PENDING_REVIEW
    Core-->>Web: 17. Render Precision Overlay Box + Regulation Citation Card
    
    Inspector->>Web: 18. Reviews Citation & Clicks CONFIRMED / OVERRIDDEN
    Web->>Core: 19. POST /api/findings/:id/accept or /override
    Core->>DB: 20. Update Audit Log & Store Inspector Decision
```

---

### 3️⃣ Diagram 3: Photo-to-Regulation RAG Pipeline Flow (Step 3 Focus)

```mermaid
flowchart LR
    %% Subgraph Styling
    classDef step fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0369a1;
    classDef highlight fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#b45309;
    classDef success fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d;

    A["📷 Facility Photo Upload<br/><i>(Corridor / Lab Photo)</i>"]:::step --> B["☁️ Roboflow RF-DETR Inference<br/><i>Model: uni2-l8vuj/1</i>"]:::step
    B --> C["🔍 Detection Item<br/><i>class: fire-extinguisher (94%)</i>"]:::highlight
    C --> D["🔎 Class-to-Query Mapper<br/><i>fire extinguisher placement AICTE norms</i>"]:::step
    D --> E["📐 sentence-transformers<br/><i>all-MiniLM-L6-v2 (384-dim)</i>"]:::step
    E --> F["🐘 pgvector Cosine Search<br/><i>ORDER BY embedding <=> query_vec</i>"]:::step
    F --> G["📄 Matched Regulation Card<br/><i>AICTE_APH_2026_Safety_Norms.pdf<br/>Page 42 - Section 4.12</i>"]:::highlight
    G --> H["🟢 Inspector Audit Decision<br/><i>CONFIRMED / OVERRIDDEN / NEEDS EVIDENCE</i>"]:::success
```

---

## ✅ Completed Milestones & Implemented Features

### 1️⃣ Step 1: Hybrid Real Document Extraction (Completed ✅)
- [x] **3-Tier Fallback Engine**: `pdfplumber` (digital text) ➔ Gemini 3.6 Flash Vision API (`google-genai`) ➔ OpenCV + PyTesseract preprocessed OCR (`pdf_extraction.py`).
- [x] **FastAPI Endpoint**: `POST /api/v1/ai/documents/analyze` returning structured text, page count, and extraction method badges.

### 2️⃣ Step 2: Live Roboflow Hosted RF-DETR Computer Vision (Completed ✅)
- [x] **Model Integration**: Connected live model `uni2-l8vuj/1` via `inference-sdk` using API key `W0iRZTQuPFKiR8l7CH6p`.
- [x] **Strict Model Class Alignment**: Restricted 100% of detections across backend & frontend strictly to the 5 Roboflow model classes:
  1. `camera`
  2. `fire-blanket`
  3. `fire-exit-sign`
  4. `fire-extinguisher`
  5. `smoke-detector`
- [x] **Precision Coordinate Normalization**: Converted center `(x, y, w, h)` coordinates to top-left relative percentages (`0-100%`) using PIL image size extraction.
- [x] **Instant AI Upload**: Uploading any image immediately triggers `analyzeImage(id)`.

### 3️⃣ Step 3: Regulation-Aware RAG with PostgreSQL `pgvector` & Inspector Audit Controls (Completed ✅)
- [x] **Database Schema**: Created `regulation_chunks` table with `pgvector` (`VECTOR(384)`), SHA-256 content hashes, and cosine similarity index (`schema_regulations.sql`).
- [x] **PDF Indexing Script**: Built `index_regulations.py` to chunk official NAAC, AICTE, UGC, and NIRF PDFs in `ai-service/regulations/` into 500-800 word vector embeddings.
- [x] **Class-to-Query RAG Search**: Mapped Roboflow detected classes to regulatory search queries in `regulation_rag.py`.
- [x] **FastAPI Endpoint**: `GET /api/v1/ai/regulations/search?q=<query>&limit=5`.
- [x] **Frontend Inspector Audit Controls**: Added Matched Regulation Cards and 3 Decision Action Buttons (**Confirm**, **Override**, **Needs Evidence**) in `VisualEvidencePage.tsx`.
- [x] **Unit Test Suite**: 22/22 passing unit tests in `ai-service/` (`pytest`).

---

## 🎯 Prioritized Implementation Roadmap

### 4️⃣ Step 4: Evidence Traceability Graph UI (Core Differentiator) (Next Step 🔜)
- **Goal**: Build an interactive provenance graph on `FindingDetailPage.tsx` linking:
  $$\text{OCR Extract} \longrightarrow \text{Visual AI Detection} \longrightarrow \text{External AISHE Baseline} \longrightarrow \text{Regulation Clause} \longrightarrow \text{Inspector Decision}$$

### 5️⃣ Step 5: Synthetic AISHE/NIRF Data Baseline & Cross-Check Demo
- **Goal**: Seed synthetic institution rows mimicking real AISHE/NIRF schemas in Spring Boot for institutional baseline verification.

### 6️⃣ Step 6: PDF Inspection Report Generation (Do Last)
- **Goal**: Automated signed PDF report generation for NAAC/AICTE institutional audit submission.

---

## 📝 Change Log

| Date & Time | Updated Component | Description of Changes |
| :--- | :--- | :--- |
| **Aug 18, 2026** | Workflow Diagrams | Added high-fidelity Mermaid architecture, sequence, and LR flowchart diagrams to `PROJECT_PROGRESS.md` & `README.md`. |
| **Aug 18, 2026** | Step 3 Regulation RAG | Implemented PostgreSQL `pgvector` RAG search, class-to-query mapping, and `index_regulations.py`. |
| **Aug 18, 2026** | Inspector Audit Controls | Added Matched Regulation Cards & 3 decision action buttons (**Confirm**, **Override**, **Needs Evidence**) in `VisualEvidencePage.tsx`. |
| **Aug 17, 2026** | Roboflow Live API | Integrated live Roboflow hosted model `uni2-l8vuj/1` using `inference-sdk` & key `W0iRZTQuPFKiR8l7CH6p`. |
| **Aug 17, 2026** | Multi-Branch Sync | Synchronized `main`, `kavin`, `bhava`, and `kaviya` git branches on local and GitHub remote. |
