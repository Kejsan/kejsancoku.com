-- Convert Experience.achievements values into text[] and normalise existing rows
ALTER TABLE "Experience"
  ALTER COLUMN "achievements" DROP DEFAULT;

ALTER TABLE "Experience"
  ALTER COLUMN "achievements" TYPE TEXT[] USING (
    CASE
      WHEN "achievements" IS NULL THEN ARRAY[]::TEXT[]
      WHEN pg_typeof("achievements")::text = 'text[]' THEN COALESCE("achievements", ARRAY[]::TEXT[])
      WHEN pg_typeof("achievements")::text IN ('json', 'jsonb') AND jsonb_typeof("achievements"::jsonb) = 'array' THEN COALESCE(
        (
          SELECT array_agg(value) FILTER (WHERE value <> '')
          FROM jsonb_array_elements_text("achievements"::jsonb) AS value
        ),
        ARRAY[]::TEXT[]
      )
      WHEN pg_typeof("achievements")::text IN ('json', 'jsonb') THEN ARRAY[]::TEXT[]
      ELSE (
        SELECT COALESCE(
          array_agg(item) FILTER (WHERE item <> ''),
          ARRAY[]::TEXT[]
        )
        FROM (
          SELECT
            btrim(
              regexp_replace(
                btrim(value, E' \t\n\r"[]'),
                '^[\-*•◦‣∙⁃]+\s*',
                '',
                'g'
              )
            ) AS item
          FROM unnest(
            regexp_split_to_array("achievements"::text, E'\\r?\\n+|,|;|•|‣|∙|◦|⁃')
          ) AS value
        ) AS cleaned
      )
    END
  );

ALTER TABLE "Experience"
  ALTER COLUMN "achievements" SET DEFAULT ARRAY[]::TEXT[];

UPDATE "Experience"
SET "achievements" = ARRAY[]::TEXT[]
WHERE "achievements" IS NULL;

ALTER TABLE "Experience"
  ALTER COLUMN "achievements" SET NOT NULL;

-- Convert Experience.skills values into text[] and normalise existing rows
ALTER TABLE "Experience"
  ALTER COLUMN "skills" DROP DEFAULT;

ALTER TABLE "Experience"
  ALTER COLUMN "skills" TYPE TEXT[] USING (
    CASE
      WHEN "skills" IS NULL THEN ARRAY[]::TEXT[]
      WHEN pg_typeof("skills")::text = 'text[]' THEN COALESCE("skills", ARRAY[]::TEXT[])
      WHEN pg_typeof("skills")::text IN ('json', 'jsonb') AND jsonb_typeof("skills"::jsonb) = 'array' THEN COALESCE(
        (
          SELECT array_agg(value) FILTER (WHERE value <> '')
          FROM jsonb_array_elements_text("skills"::jsonb) AS value
        ),
        ARRAY[]::TEXT[]
      )
      WHEN pg_typeof("skills")::text IN ('json', 'jsonb') THEN ARRAY[]::TEXT[]
      ELSE (
        SELECT COALESCE(
          array_agg(item) FILTER (WHERE item <> ''),
          ARRAY[]::TEXT[]
        )
        FROM (
          SELECT
            btrim(
              regexp_replace(
                btrim(value, E' \t\n\r"[]'),
                '^[\-*•◦‣∙⁃]+\s*',
                '',
                'g'
              )
            ) AS item
          FROM unnest(
            regexp_split_to_array("skills"::text, E'\\r?\\n+|,|;|•|‣|∙|◦|⁃')
          ) AS value
        ) AS cleaned
      )
    END
  );

ALTER TABLE "Experience"
  ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[];

UPDATE "Experience"
SET "skills" = ARRAY[]::TEXT[]
WHERE "skills" IS NULL;

ALTER TABLE "Experience"
  ALTER COLUMN "skills" SET NOT NULL;
