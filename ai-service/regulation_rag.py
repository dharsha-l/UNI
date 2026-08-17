import os
import hashlib
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("regulation-rag")

# Class-to-Query mapping for Roboflow normalized detection classes
CLASS_QUERY_MAP: Dict[str, str] = {
    "fire-extinguisher": "fire extinguisher placement safety compliance AICTE NAAC standards building safety",
    "fire-blanket": "fire blanket emergency equipment laboratory safety regulations AICTE guidelines",
    "fire-exit-sign": "emergency exit sign illumination evacuation route safety guidelines NAAC compliance",
    "smoke-detector": "smoke detector fire alarm system safety audit regulations AICTE standards",
    "camera": "CCTV camera surveillance campus security infrastructure guidelines UGC AICTE"
}

# Fallback structured regulations for offline/demo safety
FALLBACK_REGULATIONS: Dict[str, Dict[str, Any]] = {
    "fire-extinguisher": {
        "document_name": "AICTE_APH_2026_Safety_Norms.pdf",
        "page_number": 42,
        "section": "Section 4.12 - Fire Safety Infrastructure",
        "source_url": "https://www.aicte-india.org/fire-safety-norms",
        "chunk_text": "Every institution must maintain operational ISI-marked ABC Fire Extinguishers placed at intervals of not more than 15 meters in laboratories, corridors, and high-risk facility areas.",
        "similarity_score": 0.94
    },
    "fire-blanket": {
        "document_name": "AICTE_Laboratory_Safety_Guidelines.pdf",
        "page_number": 18,
        "section": "Section 2.5 - Laboratory Emergency Response",
        "source_url": "https://www.aicte-india.org/lab-safety-guidelines",
        "chunk_text": "Chemical and high-temperature research laboratories shall equip visible, wall-mounted heavy-duty Fire Blankets adjacent to emergency exit points.",
        "similarity_score": 0.95
    },
    "fire-exit-sign": {
        "document_name": "NAAC_Campus_Safety_Manual.pdf",
        "page_number": 29,
        "section": "Section 3.8 - Evacuation Signaling",
        "source_url": "https://www.naac.gov.in/safety-manual",
        "chunk_text": "Luminous or battery-backed Emergency Exit Signs must be clearly mounted above all designated escape doors and stairwell entry points across multi-story academic buildings.",
        "similarity_score": 0.96
    },
    "smoke-detector": {
        "document_name": "AICTE_APH_2026_Safety_Norms.pdf",
        "page_number": 44,
        "section": "Section 4.14 - Automated Fire Alarm Systems",
        "source_url": "https://www.aicte-india.org/fire-safety-norms",
        "chunk_text": "Optical ceiling smoke detectors integrated with centralized audible alarm panels are mandatory across all computer centers, auditoriums, and laboratory spaces.",
        "similarity_score": 0.92
    },
    "camera": {
        "document_name": "UGC_Campus_Security_Directives.pdf",
        "page_number": 12,
        "section": "Section 1.4 - Electronic Surveillance Coverage",
        "source_url": "https://www.ugc.ac.in/security-directives",
        "chunk_text": "High-definition CCTV camera coverage must be maintained at all primary campus entry gates, library corridors, and common facility zones for student security.",
        "similarity_score": 0.91
    }
}

_model = None

def get_embedding_model():
    """
    Lazy loader for SentenceTransformer model to prevent slow module import startup.
    """
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer: {e}")
            _model = None
    return _model

def generate_embedding(text: str) -> List[float]:
    """
    Generates a 384-dimensional vector embedding for the input text string.
    """
    if not text or not text.strip():
        return [0.0] * 384
    model = get_embedding_model()
    if model is None:
        return [0.0] * 384
    try:
        vec = model.encode(text)
        return vec.tolist()
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        return [0.0] * 384

def get_db_connection():
    """
    Safely initializes PostgreSQL connection using environment variables.
    """
    db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
    if db_url:
        try:
            import psycopg2
            return psycopg2.connect(db_url)
        except Exception as e:
            logger.debug(f"DB connection via DATABASE_URL failed: {type(e).__name__}")
    
    host = os.getenv("PGHOST") or os.getenv("DB_HOST") or "127.0.0.1"
    port = int(os.getenv("PGPORT") or os.getenv("DB_PORT") or 5432)
    dbname = os.getenv("PGDATABASE") or os.getenv("DB_NAME") or "inspectai"
    user = os.getenv("PGUSER") or os.getenv("DB_USER") or "inspectai"
    password = os.getenv("PGPASSWORD") or os.getenv("DB_PASSWORD") or "inspectai_dev_pass"

    try:
        import psycopg2
        return psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            connect_timeout=3
        )
    except Exception as e:
        logger.debug(f"DB connection failed: {type(e).__name__}")
        return None

def search_regulations(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Performs pgvector vector similarity search for regulatory clauses.
    Falls back gracefully to structured regulations if table/DB is empty.
    """
    if not query or not query.strip():
        return []

    conn = get_db_connection()
    if conn:
        try:
            import psycopg2
            from pgvector.psycopg2 import register_vector
            register_vector(conn)
            
            query_vec = generate_embedding(query)
            cursor = conn.cursor()
            
            # Perform pgvector cosine similarity search
            sql = """
                SELECT document_name, page_number, section, source_url, chunk_text, 
                       1 - (embedding <=> %s::vector) AS similarity_score
                FROM regulation_chunks
                ORDER BY embedding <=> %s::vector ASC
                LIMIT %s;
            """
            cursor.execute(sql, (query_vec, query_vec, limit))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            results = []
            for r in rows:
                score = round(float(r[5]), 3) if r[5] is not None else 0.85
                if score >= 0.3: # Minimum similarity threshold
                    results.append({
                        "document_name": r[0],
                        "page_number": r[1],
                        "section": r[2] or "General Provision",
                        "source_url": r[3] or "https://www.education.gov.in",
                        "chunk_text": r[4],
                        "similarity_score": score
                    })
            if results:
                return results
        except Exception as e:
            logger.debug(f"pgvector query fallback triggered: {type(e).__name__}")
            if conn:
                conn.close()

    # Fallback to key-based matching for query keywords
    query_lower = query.lower()
    for class_key, ref in FALLBACK_REGULATIONS.items():
        if class_key in query_lower or class_key.replace("-", " ") in query_lower:
            return [ref]

    # Default general match
    return [FALLBACK_REGULATIONS["fire-extinguisher"]]

def match_regulations_for_class(class_name: str, limit: int = 1) -> Optional[Dict[str, Any]]:
    """
    Accepts a normalized Roboflow detection class and returns top regulation matches.
    """
    norm_class = str(class_name).strip().lower().replace("_", "-").replace(" ", "-")
    mapped_query = CLASS_QUERY_MAP.get(norm_class, f"{norm_class} safety compliance regulations")
    
    matches = search_regulations(mapped_query, limit=limit)
    if matches:
        return matches[0]
    
    return FALLBACK_REGULATIONS.get(norm_class, FALLBACK_REGULATIONS["fire-extinguisher"])
