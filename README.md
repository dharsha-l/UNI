# UNI-INSPECTION
## AI-Assisted Evidence-Traceable Institutional Inspection Platform (SIH1730)

> **"AI suggests. Evidence explains. Inspector decides."**

UNI-INSPECTION is an enterprise-grade microservice platform for AI-assisted inspection and verification of higher educational institutions in India. Designed for **Smart India Hackathon (SIH Problem Statement SIH1730)**, it focuses on evidence traceability, cross-verification, live computer vision, and human-in-the-loop audit trail verification.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js** 18+ and **npm**
- **Java 21 (JDK 21)** and **Maven** (`mvn`)
- **Python** 3.10+ and **pip**
- **PostgreSQL 16**

---

### ⚡ One-Click Double-Tap Launchers (Recommended)

Simply run the automated launcher script for your operating system:

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
| **React Frontend** | React 19 + TypeScript + Tailwind | `5173` | **http://localhost:5173** |
| **API Gateway** | Spring Cloud Gateway | `8080` | **http://localhost:8080** |
| **Core Backend** | Spring Boot 3 (Java 21) + PostgreSQL | `8081` | **http://localhost:8081** |
| **AI Microservice** | Python FastAPI + `inference-sdk` | `8000` | **http://localhost:8000/docs** |

---

## 🎯 Completed AI & Inspection Capabilities

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
- **Features**: Automatic center-to-corner percentage bounding box coordinate conversion (`x, y, w, h` relative percentages `0-100%`) using PIL image dimension extraction, photo-relative inline box positioning, and instant live AI analysis on upload.

### 3. Human-in-the-Loop Audit & Traceability
- Inspector decision flow: **ACCEPT** or **OVERRIDE** with mandatory audit reason.
- Full evidence provenance chain linking: Document Claim ➔ Photo Detection ➔ External AISHE Baseline ➔ NAAC/AICTE Regulation ➔ Inspector Decision.

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
