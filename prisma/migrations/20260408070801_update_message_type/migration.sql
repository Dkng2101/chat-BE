-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'AI');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT';
