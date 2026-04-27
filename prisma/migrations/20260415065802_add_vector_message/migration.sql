-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column
ALTER TABLE "Message"
ADD COLUMN "embedding" vector(768);

-- IMPORTANT: cần analyze trước khi index hoạt động tốt
ANALYZE "Message";

-- Create vector index
CREATE INDEX message_embedding_idx
ON "Message"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);