import { PromoPlacement, type PromoSection } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export type ActivePromoSection = Pick<
  PromoSection,
  | "id"
  | "title"
  | "description"
  | "linkLabel"
  | "linkHref"
  | "placement"
  | "isEnabled"
  | "displayOrder"
>

export async function getActivePromoSections(): Promise<ActivePromoSection[]> {
  if (!prisma) {
    return []
  }

  try {
    const promos = await prisma.promoSection.findMany({
      where: { isEnabled: true },
      orderBy: [
        { placement: "asc" },
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    })

    return promos
  } catch (error) {
    console.warn("[promos] Failed to load promo sections", error)
    return []
  }
}

export function groupPromosByPlacement(promos: ActivePromoSection[]) {
  const grouped: Record<PromoPlacement, ActivePromoSection[]> = {
    [PromoPlacement.TOP_BAR]: [],
    [PromoPlacement.BOTTOM_BAR]: [],
    [PromoPlacement.PRE_FOOTER_CARD]: [],
  }

  for (const promo of promos) {
    grouped[promo.placement].push(promo)
  }

  return grouped
}
