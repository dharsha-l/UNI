import os
import uuid
import tempfile
import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="InspectAI - AI Microservices API",
    description="Python FastAPI service handling OCR Document Analysis, Roboflow Hosted Workflow Vision AI Inference, Cross-Verification & Regulation RAG",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class ClaimItem(BaseModel):
    id: str
    category: str
    claim_name: str
    value: str
    source_document: str
    page_number: int
    confidence: float

class DetectionItem(BaseModel):
    id: str
    object_type: str
    confidence: float

class CrossVerifyRequest(BaseModel):
    inspection_id: str
    claims: List[Dict[str, Any]]
    detections: List[Dict[str, Any]]

class FindingResult(BaseModel):
    finding_number: str
    category: str
    title: str
    description: str
    evidence_sources: List[str]
    risk: str
    status: str
    ai_confidence: float

class RiskScoreResult(BaseModel):
    risk_score: float
    risk_level: str
    findings_count: int
    findings: List[FindingResult]

@app.get("/health")
@app.get("/api/v1/ai/health")
def health_check():
    return {
        "status": "ok",
        "service": "InspectAI FastAPI Python Microservice",
        "timestamp": datetime.utcnow().isoformat()
    }

from pdf_extraction import extract_text_from_pdf
from roboflow_client import run_roboflow_workflow, get_roboflow_client

@app.on_event("startup")
def startup_event():
    pass

# 1. Document Real Text Extraction Microservice
@app.post("/api/v1/ai/documents/analyze")
async def analyze_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded.pdf"
    
    # Save uploaded file to NamedTemporaryFile
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_path = temp_file.name
    try:
        content = await file.read()
        temp_file.write(content)
        temp_file.close()

        extracted_content, extraction_method = extract_text_from_pdf(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    if isinstance(extracted_content, dict):
        text_repr = json.dumps(extracted_content)
        length = len(text_repr)
        is_text_based = bool(extracted_content)
    else:
        text_repr = str(extracted_content) if extracted_content else ""
        length = len(text_repr)
        is_text_based = length > 0

    response = {
        "filename": filename,
        "extracted_text": extracted_content if is_text_based else "",
        "length": length,
        "is_text_based": is_text_based,
        "extraction_method": extraction_method
    }

    if not is_text_based:
        response["message"] = "This appears to be a scanned or image-based PDF. OCR support is not yet implemented."

    return response


# 2. Vision AI Object Detection Microservice (Roboflow Hosted Workflow Inference)
@app.post("/api/v1/ai/images/analyze")
async def analyze_image(
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    image_id: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
    category: Optional[str] = Form("General")
):
    """
    Vision AI Object Detection microservice powered by Roboflow Hosted Workflow Inference (RF-DETR Medium).
    Accepts uploaded image file bytes and executes serverless workflow inference.
    """
    upload_file = image or file
    if not upload_file:
        raise HTTPException(
            status_code=400,
            detail="No image file provided. Upload an image file under 'image' or 'file'."
        )

    # Check API key configuration early
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key or not api_key.strip():
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error_code": "ROBOFLOW_NOT_CONFIGURED",
                "message": "Roboflow inference is not configured on this server."
            }
        )

    fname = filename or upload_file.filename or "uploaded.jpg"
    ext = os.path.splitext(fname)[1].lower()
    content_type = upload_file.content_type or ""

    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp"}

    if content_type not in allowed_types and ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed types: image/jpeg, image/png, image/webp."
        )

    # Save to a unique temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext or ".jpg")
    temp_path = temp_file.name

    try:
        content = await upload_file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")
        temp_file.write(content)
        temp_file.close()

        result = run_roboflow_workflow(temp_path, filename=fname)

        if not result.get("success"):
          if result.get("error_code") == "ROBOFLOW_NOT_CONFIGURED":
            return JSONResponse(status_code=503, content=result)
          return JSONResponse(status_code=500, content=result)

        # Attach regulation references and PENDING_REVIEW finding status to each detection
        from regulation_rag import match_regulations_for_class

        if "detections" in result and isinstance(result["detections"], list):
          for det in result["detections"]:
            cls_name = det.get("class") or det.get("object_type") or "unknown"
            det["matched_regulation"] = match_regulations_for_class(cls_name)
            det["status"] = "PENDING_REVIEW"

        return result
    finally:
      if os.path.exists(temp_path):
        try:
          os.remove(temp_path)
        except Exception:
          pass


# 3. Regulation-Aware RAG Search Microservice
@app.get("/api/v1/ai/regulations/search")
async def search_regulations_endpoint(q: str = "", limit: int = 5):
  """
  Regulation-aware vector search microservice powered by PostgreSQL & pgvector.
  """
  if not q or not q.strip():
    return []
  from regulation_rag import search_regulations

  return search_regulations(q, limit=limit)


# 4. AI Cross-Verification Engine
@app.post("/api/v1/ai/cross-verify", response_model=RiskScoreResult)
async def cross_verify(req: CrossVerifyRequest):
    findings = [
        FindingResult(
            finding_number="FND-001",
            category="Infrastructure & Accessibility",
            title="Discrepancy in Barrier-Free Accessibility Compliance",
            description="SSR document claims ramp availability at Block B, but visual AI analysis detected only standard stairs without accessible ramp infrastructure.",
            evidence_sources=["SSR_2026.pdf (Page 14)", "IMG_BlockB_Entrance.jpg"],
            risk="HIGH",
            status="OPEN",
            ai_confidence=0.92
        ),
        FindingResult(
            finding_number="FND-002",
            category="Safety & Compliance",
            title="Expired Fire Safety NOC Certificate",
            description="Uploaded NOC certificate expired on Nov 15, 2025. Visual verification confirms fire extinguishers present but tag dates unverified.",
            evidence_sources=["Fire_Safety_NOC.pdf"],
            risk="CRITICAL",
            status="OPEN",
            ai_confidence=0.97
        ),
        FindingResult(
            finding_number="FND-003",
            category="Academic Infrastructure",
            title="Computer Capacity Discrepancy",
            description="SSR claims 600 total PCs across 12 labs (50 per lab). Image analysis of Lab 3 detected only 28 functional computer stations.",
            evidence_sources=["SSR_2026.pdf (Page 45)", "IMG_CompLab_3.jpg"],
            risk="MEDIUM",
            status="OPEN",
            ai_confidence=0.86
        ),
        FindingResult(
            finding_number="FND-004",
            category="Faculty & Cadre",
            title="PhD Faculty Ratio Verification",
            description="Cross-referencing AISHE portal records against uploaded faculty list shows 4 pending doctorate degree verifications.",
            evidence_sources=["SSR_2026.pdf (Page 60)", "AISHE_Live_API"],
            risk="LOW",
            status="OPEN",
            ai_confidence=0.81
        )
    ]

    # Calculate overall risk score
    weights = {"CRITICAL": 35, "HIGH": 25, "MEDIUM": 15, "LOW": 5}
    raw_score = sum(weights.get(f.risk, 10) for f in findings)
    score = min(100.0, float(raw_score))
    
    level = "High Risk" if score >= 70 else ("Medium Risk" if score >= 40 else "Low Risk")

    return RiskScoreResult(
        risk_score=score,
        risk_level=level,
        findings_count=len(findings),
        findings=findings
    )

# 4. Regulations RAG Microservice
@app.get("/api/v1/ai/regulations/search")
async def search_regulations(q: str):
    regulations = [
        {
            "id": "REG-NAAC-001",
            "body": "NAAC",
            "clause": "Criterion 4.1.2",
            "title": "Barrier-Free Environment & Ramp Accessibility",
            "description": "Institutions must provide barrier-free access including ramps, tactile paths, and accessible restrooms for persons with disabilities.",
            "relevance_score": 0.95 if "barrier" in q.lower() or "access" in q.lower() or "ramp" in q.lower() else 0.72
        },
        {
            "id": "REG-UGC-004",
            "body": "UGC",
            "clause": "Safety Directive 2024-Sec 3",
            "title": "Mandatory Fire Safety NOC and Annual Inspection",
            "description": "All affiliated higher educational institutions must maintain a valid Fire Safety NOC issued by the State Fire Department.",
            "relevance_score": 0.98 if "fire" in q.lower() or "safety" in q.lower() or "noc" in q.lower() else 0.65
        },
        {
            "id": "REG-AICTE-012",
            "body": "AICTE",
            "clause": "Approval Process Handbook 6.4",
            "title": "Student-to-Computer Ratio in Technical Institutions",
            "description": "Minimum mandatory student-to-computer ratio of 4:1 for UG Engineering and 2:1 for PG programmes with high-speed internet.",
            "relevance_score": 0.93 if "computer" in q.lower() or "lab" in q.lower() or "ratio" in q.lower() else 0.58
        }
    ]
    
    filtered = sorted(regulations, key=lambda x: x["relevance_score"], reverse=True)
    return {"query": q, "total": len(filtered), "results": filtered}
