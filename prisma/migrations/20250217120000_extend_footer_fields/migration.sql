-- AlterTable
ALTER TABLE "SiteSettings"
  RENAME COLUMN "twitter" TO "x";

ALTER TABLE "SiteSettings"
  ADD COLUMN     "brandName" TEXT,
  ADD COLUMN     "brandRole" TEXT,
  ADD COLUMN     "brandDescription" TEXT,
  ADD COLUMN     "footerTagline" TEXT,
  ADD COLUMN     "footerNote" TEXT,
  ADD COLUMN     "footerCtaLabel" TEXT,
  ADD COLUMN     "footerCtaHref" TEXT,
  ADD COLUMN     "contactHeadline" TEXT,
  ADD COLUMN     "contactDescription" TEXT,
  ADD COLUMN     "contactLocation" TEXT,
  ADD COLUMN     "contactAvailability" TEXT,
  ADD COLUMN     "contactCtaLabel" TEXT,
  ADD COLUMN     "contactCtaHref" TEXT;
