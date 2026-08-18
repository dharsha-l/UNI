# UNI-INSPECTION
## AI-Assisted Evidence-Traceable Institutional Inspection Platform (SIH1730)

> **"AI suggests. Evidence explains. Inspector decides."**

UNI-INSPECTION is an enterprise-grade microservice platform for AI-assisted inspection and verification of higher educational institutions in India. Designed for **Smart India Hackathon (SIH Problem Statement SIH1730)**, it focuses on evidence traceability, cross-verification, live computer vision, regulation-aware RAG, and human-in-the-loop audit trail verification.

---

## 🔄 High-Fidelity Enterprise Workflow Diagrams

### 1️⃣ Microservices System Architecture Diagram

```mermaid
graph TB
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

### 2️⃣ End-to-End Inspection Sequence Diagram

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

### 3️⃣ Photo-to-Regulation RAG Engine Flowchart

```mermaid
flowchart LR
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

## ⚡ Quick Start & How to Run

### Prerequisites
- **Node.js** 18+ and **npm**
- **Java 21 (JDK 21)** and **Maven** (`mvn`)
- **Python** 3.10+ and **pip**
- **PostgreSQL 16**

---

### 🚀 One-Click Double-Tap Launchers

Run the automated launcher script for your operating system:

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
> 3. ✅ Loads local `.env` configuration and prompts interactively for missing `GEMINI_API_KEY` / `ROBOFLOW_API_KEY`.
> 4. ✅ Automatically installs `npm` and `pip` dependencies if missing and sets up `ai-service/venv`.
> 5. ✅ Clears old processes bound to ports `8000`, `8081`, `8080`, and `5173`.
> 6. ✅ Boots up Python FastAPI (`8000`), Spring Boot Core (`8081`), Spring Gateway (`8080`), and React Frontend (`5173`) concurrently.
> 7. ✅ Automatically opens your default web browser to **http://localhost:5173**.

---

## 🏛️ Microservice Ports & Services

| Service | Technology | Port | Access URL |
| :--- | :--- | :--- | :--- |
| **React Frontend** | React 19 + TypeScript + Tailwind | `5173` / `5174` | **http://localhost:5173** |
| **API Gateway** | Spring Cloud Gateway | `8080` | **http://localhost:8080** |
| **Core Backend** | Spring Boot 3 (Java 21) + PostgreSQL | `8081` | **http://localhost:8081** |
| **AI Microservice** | Python FastAPI + `inference-sdk` | `8000` | **http://localhost:8000/docs** |

---

## 🎯 Core Completed AI & Inspection Capabilities

### 1. Hybrid Real Document Extraction (Step 1 Completed ✅)
- 3-Tier fallback extraction pipeline: `pdfplumber` (digital PDF text) ➔ Gemini 3.6 Flash Vision API ➔ OpenCV + PyTesseract preprocessed OCR.

### 2. Live Roboflow Hosted RF-DETR Computer Vision (Step 2 Completed ✅)
- **Model**: Roboflow RF-DETR Object Detection (`uni2-l8vuj/1`)
- **Workspace**: `civicissue-irb9x`
- **Supported Infrastructure Classes**:
  1. `camera` (CCTV Security Units)
  2. `fire-blanket` (Fire Safety Blankets)
  3. `fire-exit-sign` (Emergency Exit Signage)
  4. `fire-extinguisher` (Fire Extinguisher Cylinders)
  5. `smoke-detector` (Ceiling Smoke Detectors)

### 3. Regulation-Aware RAG Search via `pgvector` (Step 3 Completed ✅)
- **Vector Search Engine**: PostgreSQL 16 + `pgvector` extension + `sentence-transformers/all-MiniLM-L6-v2`.
- **Deduplicated Chunker**: `index_regulations.py` reads official NAAC, AICTE, UGC, and NIRF PDFs from `ai-service/regulations/` into 500-800 word vector embeddings.
- **Class-to-Query Mapping**: Detected objects automatically trigger vector queries against official AICTE/NAAC regulatory clauses.

### 4. Human-in-the-Loop Audit Decision Controls (Step 3 Completed ✅)
- Inspector decision flow with 3 interactive action buttons:
  - 🟢 **Confirm** (`CONFIRMED`)
  - 🔴 **Override** (`OVERRIDDEN`)
  - 🟡 **Needs Evidence** (`NEEDS_MORE_EVIDENCE`)

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Inspector** | `inspector@demo.com` | `inspector123` |
| **Inspection Admin** | `admin@demo.com` | `admin123` |
| **Institution Staff** | `staff@demo.com` | `staff123` |

---

## 📌 Multi-Branch Synchronization

All 4 project branches on local and remote GitHub (`origin`) are kept 100% synchronized:
- `main`
- `kavin`
- `bhava`
- `kaviya`

---

## 📜 License & Context

Built for the **Smart India Hackathon (SIH1730)**. Open for educational and institutional evaluation.  
*"AI suggests. Evidence explains. Inspector decides."*
