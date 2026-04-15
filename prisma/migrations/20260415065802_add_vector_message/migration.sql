-- AlterTable

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Message" ADD COLUMN     "embedding" vector(1536);
