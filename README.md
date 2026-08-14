# UNI-INSPECTION
## AI-Assisted Evidence-Traceable Institutional Inspection Platform

> **"AI suggests. Evidence explains. Inspector decides."**

UNI-INSPECTION is a software prototype for AI-assisted inspection and verification of higher educational institutions in India. It is designed for the **Smart India Hackathon (SIH)** context and positioned as a lean, technically credible prototype focused on evidence traceability, cross-verification, and human-in-the-loop inspection.

---

## Problem Statement

Traditional institutional inspections require inspectors to manually:
- Review SSR/self-study reports, faculty records, infrastructure documents
- Search and compare fragmented evidence across multiple sources
- Cross-reference against AISHE/NIRF external data
- Write inspection reports manually

**The result:** Time-consuming, inconsistent, error-prone inspection processes with no systematic evidence trail.

---

## Solution: UNI-INSPECTION

```
Institution Evidence (Documents + Images + External Data)
    ↓
AI Document Analysis (OCR + Extraction)
    ↓
AI Vision Analysis (YOLO Object Detection)
    ↓
External Data Retrieval (AISHE/NIRF-style dataset)
    ↓
Cross-Verification Engine (Document vs Image vs External)
    ↓
Potential Finding Generated
    ↓
Regulation-Aware RAG (NAAC/AICTE/UGC/NIRF references)
    ↓
Evidence Trace Created
    ↓
Human Inspector Reviews → ACCEPT or OVERRIDE
    ↓
Final Report with Audit Trail
```

**The AI DOES NOT:**
- Replace the inspector
- Automatically accredit or reject institutions
- Make final inspection decisions
- Invent regulatory clauses

**The AI DOES:**
- Generate "Potential Finding — Manual Verification Required"
- Trace every finding back to its source evidence
- Retrieve relevant regulatory references
- Provide an explainable risk score

---

## Core Innovations

### 1. Evidence-Level Cross-Verification
For every institutional claim, UNI-INSPECTION cross-verifies across THREE sources:
- **Document Evidence** (OCR from SSR, faculty records, etc.)
- **Visual Evidence** (AI object detection from uploaded images)
- **External Data** (AISHE/NIRF-style public dataset)

**Example (Key Demo):**
| Source | Value |
|--------|-------|
| Institution Claim (SSR Page 42) | 10 Laboratories |
| Visual AI Detection (YOLO) | 8 identifiable lab spaces |
| AISHE 2025 External Data | 9 laboratories |
| **UNI-INSPECTION Result** | **Potential Discrepancy → Manual Verification Required** |

### 2. Evidence Trace
Every finding shows a complete provenance chain:
```
Finding → Institution Claim → Document (page) → Image (detection) → External Data → Regulation → AI Confidence → Inspector Decision
```

### 3. Regulation-Aware RAG
A controlled regulatory knowledge base covering NAAC, AICTE, UGC, and NIRF documents. Retrieved regulations are labeled as "Demo Regulatory Reference" — no fabricated clauses.

### 4. Human-in-the-Loop Audit
- Inspector can **ACCEPT** or **OVERRIDE** each AI finding
- Override requires a mandatory reason + comment
- All decisions timestamped and stored in audit trail
- Final report includes accepted, overridden, and pending findings

---

## Competitor Differentiation

| Feature | InspectAI (IJRASET) | INSPIRO | deQ OBE | UNI-INSPECTION |
|---------|---------------------|---------|---------|----------------|
| Cross-verification (Doc+Image+External) | ❌ | Partial | ❌ | ✅ |
| Evidence Trace | ❌ | ❌ | ❌ | ✅ |
| Regulation-Aware RAG | ❌ | ❌ | ❌ | ✅ |
| Human-in-the-Loop Override | ❌ | Partial | ❌ | ✅ |
| AISHE/NIRF Cross-Reference | ❌ | ❌ | ❌ | ✅ |
| Visual Evidence (YOLO) | ❌ | Partial | ❌ | ✅ |
| Inspector-Centric Workflow | ❌ | ❌ | ❌ | ✅ |

---

## Architecture

```
Frontend (React/TypeScript/Vite/Tailwind)
    ↕ REST API
Backend (Node.js/Express/TypeScript)
    ├── In-memory DB (demo) → replaceable with PostgreSQL
    ├── Document AI Service (Mock → Tesseract OCR)
    ├── Vision AI Service (Mock → YOLOv8)
    ├── Cross-Verification Engine (Rule-based)
    ├── Regulation RAG Service (Mock → sentence-transformers + FAISS)
    └── Report Service
```

**For production/future:**
```
Frontend → Spring Boot REST API → PostgreSQL
Spring Boot → Python FastAPI
    ├── Tesseract OCR
    ├── PyMuPDF (PDF extraction)
    ├── YOLOv8 (object detection)
    ├── Sentence Transformers
    └── FAISS/ChromaDB (vector search)
```

---

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router v7
- Axios
- Recharts
- Lucide React

**Backend (Demo/MVP):**
- Node.js + Express + TypeScript
- ts-node-dev (hot reload)
- UUID for record IDs
- In-memory database (mirroring relational schema)

**AI/ML (Mocked for Demo — Seeded Adapters):**
- Document AI: OCR extraction simulation
- Vision AI: YOLO detection seeded adapter
- RAG: Keyword-based regulation retrieval
- Cross-Verification: Rule-based engine

---

## Features

### Core Workflow
- ✅ **Login** — JWT-ready authentication with demo credentials
- ✅ **Dashboard** — Stats, risk trends, active inspection highlights
- ✅ **Institutions** — Institution registry with AISHE codes
- ✅ **Inspection Creation** — Start new inspection for any institution
- ✅ **Document Upload** — PDF/DOCX/TXT with simulated OCR
- ✅ **Image Upload** — JPG/PNG with simulated YOLO detection
- ✅ **AI Cross-Verification** — Animated pipeline with progress steps
- ✅ **External Data Comparison** — AISHE/NIRF comparison table
- ✅ **5 Seeded Demo Findings** — Matching specification exactly

### Finding Management
- ✅ **Finding Detail Page** — Full evidence trace, AI explanation
- ✅ **Inspector Decision** — Accept / Override with mandatory reason
- ✅ **Audit Trail** — Timestamp + inspector comment stored
- ✅ **Regulation RAG** — Retrieved regulations per finding

### Evidence Traceability
- ✅ **Evidence Trace UI** — Visual chain from claim to decision
- ✅ **Source Documents** — Page-level evidence links
- ✅ **Visual Evidence** — YOLO detection results with confidence
- ✅ **External Data** — AISHE/NIRF cross-reference

### Reporting
- ✅ **Report Generation** — Complete inspection report
- ✅ **Download** — JSON export
- ✅ **Risk Summary** — High/Medium/Low breakdown
- ✅ **Inspector Decisions Summary** — Accepted/Overridden/Pending

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Inspector accounts |
| `institutions` | Institution registry (AISHE code, affiliation) |
| `inspections` | Inspection records |
| `documents` | Uploaded documents per inspection |
| `images` | Uploaded images per inspection |
| `claims` | Extracted metrics from documents |
| `detections` | YOLO detection results from images |
| `findings` | AI-generated potential findings |
| `regulations` | Regulatory knowledge base (NAAC, AICTE, UGC, NIRF) |
| `external_data` | AISHE/NIRF-style public dataset |
| `reports` | Generated inspection reports |

---

## API Endpoints

```
POST /api/auth/login                    - Login
GET  /api/analytics/dashboard           - Dashboard stats
GET  /api/institutions                  - List institutions
GET  /api/institutions/:id              - Institution detail
GET  /api/inspections                   - List inspections
POST /api/inspections                   - Create inspection
GET  /api/inspections/:id               - Inspection detail
POST /api/inspections/:id/cross-verify  - Run AI cross-verification
GET  /api/documents/:inspectionId       - Documents list
POST /api/documents/upload              - Upload document
POST /api/documents/:id/analyze         - Analyze document (AI)
GET  /api/images/:inspectionId          - Images list
POST /api/images/upload                 - Upload image
POST /api/images/:id/analyze            - Analyze image (YOLO)
GET  /api/findings/:inspectionId        - List findings
GET  /api/findings/detail/:id           - Finding detail
POST /api/findings/:id/accept           - Accept finding
POST /api/findings/:id/override         - Override finding (reason required)
GET  /api/regulations                   - All regulations
GET  /api/regulations/search?q=         - Search regulations (RAG)
POST /api/reports/:inspectionId/generate - Generate report
GET  /api/reports/:inspectionId          - Get report
GET  /api/analytics/external/:instId    - External data for institution
GET  /api/analytics/claims/:inspId      - Extracted claims for inspection
GET  /api/health                        - Health check
```

---

## AI Pipeline

### Document AI (Mock → Real: Tesseract + PyMuPDF)
1. Uploaded PDF parsed by OCR service
2. Key fields extracted: student count, faculty count, lab count, certificates
3. Each extracted value includes: value, confidence, source document, page number
4. Claims stored per inspection

### Vision AI (Mock → Real: YOLOv8)
1. Uploaded image passed to YOLO service
2. Objects detected: fire extinguisher, lab bench, whiteboard, student desk, etc.
3. Each detection includes: object_type, confidence, bounding box
4. Demo images show 8 identifiable lab spaces (vs 10 claimed)

### Cross-Verification Engine (Rule-based)
```
For each metric:
  document_value vs external_value:
    if diff% > 10%  → MISMATCH (High or Medium risk)
    if diff% > 2%   → MINOR_MISMATCH (Low-Medium risk)
    if consistent   → CONSISTENT
  
  If visual evidence insufficient → INSUFFICIENT_EVIDENCE
  If visual shows different count → POTENTIAL_MISMATCH
  If document missing → MISSING_EVIDENCE
```

### Regulation-Aware RAG (Mock → Real: sentence-transformers + FAISS)
- Finding category + title used as query
- Keyword matching against regulation tags, title, excerpt
- Returns top matching regulations with source, section, excerpt
- All demo regulations labeled: "Demo Regulatory Reference"

---

## Seeded Demo Findings

| # | Finding | Priority | AI Confidence |
|---|---------|----------|---------------|
| F-001 | Student Enrollment Discrepancy (3000 vs 2750 AISHE) | HIGH | 89% |
| F-002 | Faculty Data Mismatch (150 vs 148 AISHE) | MEDIUM | 91% |
| F-003 | Fire Safety Evidence Requires Verification | HIGH | 88% |
| F-004 | **Laboratory Evidence Discrepancy (10 vs 8 visual vs 9 AISHE)** | MEDIUM | 82% |
| F-005 | Missing Supporting Document (Affiliation Certificate) | MEDIUM | 95% |

> **F-004 is the key demo screen** — demonstrates the tri-source cross-verification innovation.

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start (Windows PowerShell)

```powershell
# Clone/navigate to project directory
cd e:\UNI-sample

# Install root dependencies
npm install

# Start both services
.\start.ps1
```

### Manual Start

**Backend (Terminal 1):**
```powershell
cd e:\UNI-sample\backend
npm install
npm run dev
# Runs on http://localhost:3001
```

**Frontend (Terminal 2):**
```powershell
cd e:\UNI-sample\frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Demo Credentials

| Field | Value |
|-------|-------|
| Email | `inspector@uninspection.demo` |
| Password | `password123` |
| Demo Institution | ABC Engineering College |
| AISHE Code | CSE-UNI-001 |
| Affiliation | Anna University |
| Location | Chennai, Tamil Nadu |
| Active Inspection | INS-2026-001 |

---

## Demo Flow (Recommended Walkthrough)

1. **Login** → `inspector@uninspection.demo` / `password123`
2. **Dashboard** → View stats, risk trends, active inspection highlight
3. **Institutions** → See ABC Engineering College (CSE-UNI-001)
4. **Inspections → INS-2026-001** → ABC Engineering College detail
5. **AI Cross-Verification** → Click "Run Cross-Verification" → Watch animated pipeline
6. **External Data Comparison** → Students: 3000 vs 2750 AISHE | Labs: 10 vs 9 AISHE
7. **Findings** → 5 AI findings with risk levels and confidence scores
8. **Finding F-004** ← THE KEY DEMO SCREEN
   - Title: Laboratory Evidence Discrepancy
   - Institution: 10 labs | Visual AI: 8 spaces | External: 9 labs
   - Evidence Trace chain
   - Click **Accept** or **Override** with reason
9. **Regulations** → Browse NAAC/AICTE/UGC/NIRF regulatory references
10. **Report** → Generate and download inspection report

---

## Environment Variables

```env
# Backend (.env)
PORT=3001
NODE_ENV=development

# Future production settings
DATABASE_URL=postgresql://localhost:5432/uninspection
JWT_SECRET=your-secret-key
```

See `.env.example` for all available variables.

---

## Limitations (Demo Prototype)

- In-memory database (no persistence between restarts)
- Mocked AI services (seeded adapters for reliable demo)
- No real file storage (uploads simulated)
- No real OCR (Tesseract integration designed but not connected)
- No real YOLO inference (seeded detection results)
- No real RAG (keyword matching instead of vector search)
- Single user system (no multi-user roles in MVP)

---

## Future Scope

- **Real OCR:** Tesseract + PyMuPDF for actual PDF extraction
- **Real YOLO:** YOLOv8 for actual infrastructure image analysis
- **Real RAG:** sentence-transformers + FAISS/ChromaDB vector search
- **PostgreSQL:** Replace in-memory DB with persistent storage
- **Spring Boot:** Replace Node.js backend with Java/Spring Boot
- **AISHE Live API:** Connect to actual AISHE/NIRF government APIs
- **Multi-Inspector:** Role-based access (IQAC, Dean, Principal, Inspector)
- **GPS/EXIF:** Image authenticity verification
- **Mobile App:** Inspector app for on-site verification
- **Blockchain Audit:** Immutable finding audit trail

---

## Disclaimer

UNI-INSPECTION provides AI-assisted inspection recommendations. Final inspection decisions remain with the authorized human inspector. This system does not constitute an accreditation decision. Risk scores are inspection-support indicators only and do not determine institutional approval or rejection.

Demo regulatory references are for demonstration purposes only. Always verify against current official documents from NAAC, AICTE, UGC, and NIRF.

---

## License

MIT License — Open for educational and hackathon use.

---

*UNI-INSPECTION — "AI suggests. Evidence explains. Inspector decides."*
