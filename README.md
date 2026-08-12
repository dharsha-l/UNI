# InspectAI

**Evidence-driven. AI-assisted. Human-verified.**

A full-stack prototype for AI-driven institutional inspection, built for SIH/hackathon demonstration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Run the Application

**Option 1: Using the startup script**
```powershell
.\start.ps1
```

**Option 2: Manually (two terminal windows)**

Terminal 1 — Backend:
```bash
cd backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

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

## 🏗️ Architecture

```
frontend/          React + Vite + TypeScript + Tailwind CSS
  src/
    pages/         All 15+ application pages
    components/    Layout, shared components
    services/      API service layer (axios)
    context/       Auth context

backend/           Node.js + Express + TypeScript
  src/
    routes/        REST API routes
    services/      Mock AI services (replaceable)
    database.ts    In-memory data store
```

---

## 🤖 AI Services (Mock → Production)

| Service | Current | Production |
|---------|---------|------------|
| Document OCR | Mock | Tesseract OCR / Azure AI |
| Visual Detection | Mock | YOLOv8 via Python/FastAPI |
| Cross-Verification | Mock | Custom pipeline |
| Regulation RAG | Mock | sentence-transformers + vector DB |
| External Data | Mock | AISHE/NIRF live APIs |

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
