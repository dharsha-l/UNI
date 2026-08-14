import pdfplumber

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Opens a digital PDF file using pdfplumber and extracts text page by page.
    Concatenates page text with newline separators.
    Returns stripped text or empty string if no text is found.
    Does NOT perform OCR or raise errors on empty text.
    """
    extracted_pages = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_pages.append(text)
    except Exception:
        return ""

    if not extracted_pages:
        return ""

    full_text = "\n".join(extracted_pages).strip()
    return full_text
