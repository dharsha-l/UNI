#!/usr/bin/env python3
import os
import sys
import glob
import hashlib
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables safely from .env
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("index-regulations")

def compute_content_hash(doc_name: str, page_num: int, chunk_text: str) -> str:
    """
    Computes a deterministic SHA-256 content hash to prevent duplicate chunk indexing.
    """
    raw_str = f"{doc_name}:{page_num}:{chunk_text.strip()}"
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

def chunk_text_by_words(text: str, target_words: int = 500, max_words: int = 800) -> List[str]:
    """
    Splits page text into chunks of approximately 500-800 words.
    """
    words = text.split()
    if not words:
        return []
    
    chunks = []
    current_words = []
    
    for word in words:
        current_words.append(word)
        if len(current_words) >= target_words and word.endswith((".", ":", ";", "\n")):
            chunks.append(" ".join(current_words))
            current_words = []
        elif len(current_words) >= max_words:
            chunks.append(" ".join(current_words))
            current_words = []

    if current_words:
        chunks.append(" ".join(current_words))

    return chunks

def extract_pdf_chunks(pdf_path: str) -> List[Dict[str, Any]]:
    """
    Reads a PDF file page-by-page, preserving page numbers, and returns text chunks.
    """
    doc_name = os.path.basename(pdf_path)
    chunks_data = []

    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page_idx, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                if not text.strip():
                    continue
                
                page_chunks = chunk_text_by_words(text)
                for chunk_idx, chunk in enumerate(page_chunks, start=1):
                    c_hash = compute_content_hash(doc_name, page_idx, chunk)
                    chunks_data.append({
                        "document_name": doc_name,
                        "page_number": page_idx,
                        "section": f"Page {page_idx} - Section {chunk_idx}",
                        "source_url": f"https://www.education.gov.in/regulations/{doc_name}",
                        "chunk_text": chunk,
                        "content_hash": c_hash
                    })
    except Exception as e:
        logger.error(f"Error reading PDF {doc_name}: {e}")

    return chunks_data

def index_all_regulations():
    """
    Main indexing process: scans regulations/, embeds text chunks, and upserts into PostgreSQL.
    """
    regulations_dir = os.path.join(os.path.dirname(__file__), "regulations")
    pdf_files = glob.glob(os.path.join(regulations_dir, "*.pdf"))

    logger.info(f"Scanning regulations directory: {regulations_dir}")
    if not pdf_files:
        logger.info("No regulation PDF files found in ai-service/regulations/. Add official NAAC/AICTE PDFs here to index.")
        return

    logger.info(f"Found {len(pdf_files)} PDF document(s) to index.")

    from regulation_rag import generate_embedding, get_db_connection
    conn = get_db_connection()

    if conn is None:
        logger.warning("Could not connect to PostgreSQL database. Safe dry-run check complete.")
        return

    try:
        import psycopg2
        from pgvector.psycopg2 import register_vector

        cursor = conn.cursor()
        
        # Ensure pgvector extension and table exist
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS regulation_chunks (
                id VARCHAR(64) PRIMARY KEY,
                document_name VARCHAR(255) NOT NULL,
                page_number INT NOT NULL,
                section VARCHAR(255),
                source_url VARCHAR(512),
                chunk_text TEXT NOT NULL,
                content_hash VARCHAR(64) UNIQUE NOT NULL,
                embedding VECTOR(384),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()

        total_indexed = 0
        total_skipped = 0

        for pdf_path in pdf_files:
            doc_name = os.path.basename(pdf_path)
            logger.info(f"Indexing PDF document: {doc_name}...")
            chunks = extract_pdf_chunks(pdf_path)

            for item in chunks:
                # Check for existing duplicate content hash
                cursor.execute("SELECT id FROM regulation_chunks WHERE content_hash = %s;", (item["content_hash"],))
                if cursor.fetchone():
                    total_skipped += 1
                    continue

                # Generate 384-dim vector embedding
                vec = generate_embedding(item["chunk_text"])
                item_id = f"chunk-{item['content_hash'][:16]}"

                sql = """
                    INSERT INTO regulation_chunks (id, document_name, page_number, section, source_url, chunk_text, content_hash, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector)
                    ON CONFLICT (content_hash) DO NOTHING;
                """
                cursor.execute(sql, (item_id, item["document_name"], item["page_number"], item["section"], item["source_url"], item["chunk_text"], item["content_hash"], vec))
                total_indexed += 1

            conn.commit()

        logger.info(f"Indexing completed successfully! Newly Indexed: {total_indexed}, Skipped (Already Indexed): {total_skipped}.")
        cursor.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error during regulation indexing: {e}")
        if conn:
            conn.close()

if __name__ == "__main__":
    index_all_regulations()
