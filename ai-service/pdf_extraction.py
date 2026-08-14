import os
import json
import logging
import tempfile
import base64
from typing import Dict, Any, Tuple

import pdfplumber
import cv2
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pdf_extraction")

# Optional imports with graceful handling
try:
    from pdf2image import convert_from_path
except ImportError:
    convert_from_path = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

def extract_text_via_gemini(pdf_path: str) -> Dict[str, Any]:
    """
    Extracts structured fields from scanned/complex PDF using Google Gemini API.
    Reads GEMINI_API_KEY from environment.
    Returns {"success": False, "reason": ...} if key missing or call fails.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "" or api_key == "your_key_here":
        logger.warning("GEMINI_API_KEY is missing or empty. Skipping Gemini Vision.")
        return {"success": False, "reason": "no_api_key"}

    if not genai:
        logger.warning("google-genai package not available. Skipping Gemini Vision.")
        return {"success": False, "reason": "genai_package_missing"}

    try:
        client = genai.Client(api_key=api_key)
        
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        prompt = (
            "Extract the following fields as JSON: total enrollment, faculty count, "
            "key dates, and any numeric metrics mentioned. "
            "Return ONLY valid JSON, no markdown formatting."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=pdf_bytes,
                    mime_type="application/pdf"
                ),
                prompt
            ]
        )

        raw_output = response.text.strip() if response.text else ""
        
        # Clean markdown formatting if present
        clean_text = raw_output
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        try:
            parsed_data = json.loads(clean_text)
            return {"success": True, "data": parsed_data, "raw": raw_output}
        except Exception:
            return {"success": True, "data": {"raw_text": raw_output}, "raw": raw_output}

    except Exception as e:
        logger.error(f"Gemini Vision extraction error: {e}")
        return {"success": False, "reason": str(e)}

def preprocess_image_opencv(cv_img: np.ndarray) -> np.ndarray:
    """Preprocesses image: grayscale, adaptive thresholding, and optional deskewing."""
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    
    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Deskew check
    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) > 0:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
            
        if abs(angle) > 2.0:
            (h, w) = thresh.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            thresh = cv2.warpAffine(
                thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
            )

    return thresh

def extract_text_via_ocr_fallback(pdf_path: str) -> str:
    """Fallback OCR using pdf2image + OpenCV preprocessing + pytesseract."""
    if not convert_from_path or not pytesseract:
        logger.warning("pdf2image or pytesseract missing for OCR fallback.")
        return ""

    try:
        images = convert_from_path(pdf_path)
        extracted_pages = []
        
        for img in images:
            # Convert PIL image to OpenCV format
            open_cv_image = np.array(img)
            open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)

            processed = preprocess_image_opencv(open_cv_image)
            text = pytesseract.image_to_string(processed)
            if text and text.strip():
                extracted_pages.append(text.strip())

        return "\n".join(extracted_pages).strip()
    except Exception as e:
        logger.error(f"OCR fallback error: {e}")
        return ""

def extract_text_from_pdf(pdf_path: str) -> Tuple[Any, str]:
    """
    Main PDF extraction pipeline:
    1. pdfplumber (Digital text PDF)
    2. Gemini Vision API (Scanned / Complex PDF)
    3. OpenCV + PyTesseract (Offline OCR Fallback)
    
    Returns tuple: (extracted_content, extraction_method)
    """
    # Path A: Try pdfplumber
    digital_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages = []
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages.append(t)
            if pages:
                digital_text = "\n".join(pages).strip()
    except Exception as e:
        logger.warning(f"pdfplumber exception: {e}")

    if digital_text:
        logger.info("Used: pdfplumber")
        return digital_text, "pdfplumber"

    # Path B: Try Gemini Vision API
    gemini_res = extract_text_via_gemini(pdf_path)
    if gemini_res.get("success"):
        logger.info("Used: Gemini Vision")
        data = gemini_res.get("data")
        return data, "gemini_vision"

    # Path C: OpenCV + PyTesseract OCR Fallback
    logger.info("Falling back to OpenCV + Tesseract OCR...")
    ocr_text = extract_text_via_ocr_fallback(pdf_path)
    if ocr_text:
        logger.info("Used: OpenCV+Tesseract fallback")
        return ocr_text, "ocr_fallback"

    logger.info("Used: ocr_fallback (No text extracted)")
    return "", "ocr_fallback"
