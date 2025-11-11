-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Post"
  ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "scheduledAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "statusChangedBy" TEXT;

-- Backfill status metadata based on the legacy published flag
UPDATE "Post"
SET
  "status" = CASE WHEN "published" THEN 'PUBLISHED' ELSE 'DRAFT' END,
  "publishedAt" = CASE WHEN "published" THEN COALESCE("publishedAt", "updatedAt") ELSE NULL END,
  "statusChangedAt" = COALESCE("statusChangedAt", "updatedAt")
WHERE TRUE;

-- Ensure the legacy boolean flag remains consistent with the new enum
UPDATE "Post"
SET "published" = CASE WHEN "status" = 'PUBLISHED' THEN TRUE ELSE FALSE END;
