-- Enable pgvector extension if available
CREATE EXTENSION IF NOT EXISTS vector;

-- Regulation Chunks Table for pgvector similarity search
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

-- Index for fast cosine similarity vector search
CREATE INDEX IF NOT EXISTS idx_regulation_chunks_embedding 
ON regulation_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
