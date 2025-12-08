-- AlterTable
ALTER TABLE "public"."Experience" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "public"."Experience" ADD COLUMN "roles" JSONB;

-- AlterTable
ALTER TABLE "public"."WebApp" ADD COLUMN "image" TEXT;
ALTER TABLE "public"."WebApp" ADD COLUMN "blogPostSlug" TEXT;
ALTER TABLE "public"."WebApp" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Tool" ADD COLUMN "image" TEXT;
ALTER TABLE "public"."Tool" ADD COLUMN "blogPostSlug" TEXT;
ALTER TABLE "public"."Tool" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."WorkSample" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Skill" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
