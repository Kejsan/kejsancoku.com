-- CreateTable
CREATE TABLE "Footer" (
  "id" SERIAL PRIMARY KEY,
    "copyright" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
