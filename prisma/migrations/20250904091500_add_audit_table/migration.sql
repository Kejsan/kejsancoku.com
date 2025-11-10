-- CreateTable
CREATE TABLE "Audit" (
    "id" SERIAL NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "diff" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);
