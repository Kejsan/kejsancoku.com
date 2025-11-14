ALTER TABLE "Experience"
  RENAME COLUMN "role" TO "title";

ALTER TABLE "Experience"
  ADD COLUMN "period" TEXT,
  ADD COLUMN "location" TEXT,
  ADD COLUMN "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  ADD COLUMN "fullDescription" TEXT,
  ADD COLUMN "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  ADD COLUMN "careerProgression" JSONB,
  ADD COLUMN "previousRole" JSONB;
