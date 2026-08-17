import pytest
from unittest.mock import patch, MagicMock
from index_regulations import chunk_text_by_words, compute_content_hash
from regulation_rag import (
    CLASS_QUERY_MAP,
    FALLBACK_REGULATIONS,
    search_regulations,
    match_regulations_for_class,
    generate_embedding
)

def test_text_chunking():
    """
    Tests text chunking algorithm for 500-800 word paragraph splitting.
    """
    sample_text = "Word " * 1200
    chunks = chunk_text_by_words(sample_text, target_words=500, max_words=800)
    assert len(chunks) == 2
    assert len(chunks[0].split()) == 800
    assert len(chunks[1].split()) == 400

def test_content_hash_consistency():
    """
    Tests deterministic content hash computation for duplicate prevention.
    """
    h1 = compute_content_hash("NAAC_Manual.pdf", 12, "Fire safety equipment norms.")
    h2 = compute_content_hash("NAAC_Manual.pdf", 12, "Fire safety equipment norms.")
    h3 = compute_content_hash("NAAC_Manual.pdf", 13, "Fire safety equipment norms.")
    assert h1 == h2
    assert h1 != h3

def test_class_to_query_mapping():
    """
    Tests mapping of Roboflow normalized detection classes to regulation search queries.
    """
    expected_classes = ["fire-extinguisher", "fire-blanket", "fire-exit-sign", "smoke-detector", "camera"]
    for cls in expected_classes:
        assert cls in CLASS_QUERY_MAP
        assert len(CLASS_QUERY_MAP[cls]) > 10

def test_empty_search_results():
    """
    Tests searching with empty query strings.
    """
    assert search_regulations("") == []
    assert search_regulations("   ") == []

@patch("regulation_rag.get_embedding_model")
def test_mocked_embedding_generation(mock_get_model):
    """
    Tests embedding generation with a mocked SentenceTransformer model (no external API calls).
    """
    mock_model_instance = MagicMock()
    mock_model_instance.encode.return_value = MagicMock(tolist=lambda: [0.1] * 384)
    mock_get_model.return_value = mock_model_instance

    vec = generate_embedding("fire safety regulations")
    assert len(vec) == 384
    assert vec[0] == 0.1

@patch("regulation_rag.get_db_connection")
def test_match_regulations_for_class_fallback(mock_get_db):
    """
    Tests matching regulations for a detected class when DB is offline or empty.
    """
    mock_get_db.return_value = None  # DB offline
    
    match = match_regulations_for_class("fire-extinguisher")
    assert match is not None
    assert match["document_name"] == "AICTE_APH_2026_Safety_Norms.pdf"
    assert "fire-extinguisher" in CLASS_QUERY_MAP

def test_all_roboflow_classes_have_regulation_match():
    """
    Verifies that all 5 Roboflow model classes have defined regulation matches.
    """
    classes = ["fire-extinguisher", "fire-blanket", "fire-exit-sign", "smoke-detector", "camera"]
    for cls in classes:
        match = match_regulations_for_class(cls)
        assert match is not None
        assert "document_name" in match
        assert "page_number" in match
        assert "section" in match
        assert "chunk_text" in match
