import os
import tempfile
import pytest
from fastapi.testclient import TestClient
from fpdf import FPDF

from main import app

client = TestClient(app)

def create_sample_pdf(text_content: str) -> str:
    """Helper to generate a small text-based PDF file at runtime using fpdf2."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    pdf.cell(text=text_content)
    
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(temp_pdf.name)
    temp_pdf.close()
    return temp_pdf.name

def create_multipage_pdf(pages_text: list) -> str:
    """Helper to generate a multi-page PDF document at runtime."""
    pdf = FPDF()
    for text in pages_text:
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        pdf.cell(text=text)
        
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(temp_pdf.name)
    temp_pdf.close()
    return temp_pdf.name

def test_documents_analyze_text_based_pdf():
    known_text = "Total Enrollment 2023: 1240"
    pdf_path = create_sample_pdf(known_text)
    
    try:
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/ai/documents/analyze",
                files={"file": ("sample_report.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["filename"] == "sample_report.pdf"
        assert known_text in data["extracted_text"]
        assert data["is_text_based"] is True
        assert data["length"] > 0
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

def test_documents_analyze_multi_page_pdf():
    pages_text = [
        "Page 1: Institution Overview - ABC Engineering College",
        "Page 2: Faculty Count - 85 PhD Members",
        "Page 3: Infrastructure - 12 Computer Labs"
    ]
    pdf_path = create_multipage_pdf(pages_text)

    try:
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/ai/documents/analyze",
                files={"file": ("multipage_ssr.pdf", f, "application/pdf")}
            )

        assert response.status_code == 200
        data = response.json()
        
        assert data["filename"] == "multipage_ssr.pdf"
        assert data["is_text_based"] is True
        
        # Verify text from ALL 3 pages is extracted
        for expected_text in pages_text:
            assert expected_text in data["extracted_text"]
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

def test_documents_analyze_empty_or_image_pdf():
    # Create empty PDF
    pdf = FPDF()
    pdf.add_page()
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(temp_pdf.name)
    temp_pdf.close()

    try:
        with open(temp_pdf.name, "rb") as f:
            response = client.post(
                "/api/v1/ai/documents/analyze",
                files={"file": ("scanned_mock.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "scanned_mock.pdf"
        assert data["is_text_based"] is False
        assert "message" in data
        assert "scanned or image-based PDF" in data["message"]
    finally:
        if os.path.exists(temp_pdf.name):
            os.remove(temp_pdf.name)
