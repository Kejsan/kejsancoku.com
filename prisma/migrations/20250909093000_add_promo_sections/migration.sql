-- CreateEnum
CREATE TYPE "PromoPlacement" AS ENUM ('TOP_BAR', 'BOTTOM_BAR', 'PRE_FOOTER_CARD');

-- CreateTable
CREATE TABLE "PromoSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "linkLabel" TEXT,
    "linkHref" TEXT,
    "placement" "PromoPlacement" NOT NULL DEFAULT 'PRE_FOOTER_CARD',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromoSection_pkey" PRIMARY KEY ("id")
);
