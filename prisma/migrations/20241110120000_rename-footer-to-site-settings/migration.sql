-- Drop old Footer table if it exists
DROP TABLE IF EXISTS "Footer";

-- Create new SiteSettings table
CREATE TABLE "SiteSettings" (
    "id" SERIAL PRIMARY KEY,
    "copyright" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
