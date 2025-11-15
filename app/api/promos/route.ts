import { NextResponse } from "next/server"
import { PromoPlacement } from "@prisma/client"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import { getSafeAdminSession } from "@/lib/safe-session"

function ensureString(value: unknown) {
  if (typeof value !== "string") {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function parsePlacement(value: unknown): PromoPlacement | null {
  if (typeof value !== "string") {
    return null
  }

  return Object.values(PromoPlacement).includes(value as PromoPlacement)
    ? (value as PromoPlacement)
    : null
}

function coerceDisplayOrder(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value))
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return Math.max(0, parsed)
    }
  }

  return 0
}

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    )
  }

  const promos = await prisma.promoSection.findMany({
    orderBy: [
      { placement: "asc" },
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
  })

  return NextResponse.json(promos)
}

export async function POST(request: Request) {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    )
  }

  const payload = await request.json()
  const placement = parsePlacement(payload.placement)
  const title = ensureString(payload.title)

  if (!placement) {
    return NextResponse.json(
      { error: "placement is required" },
      { status: 400 },
    )
  }

  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 },
    )
  }

  const description = ensureString(payload.description) ?? null
  const linkLabel = ensureString(payload.linkLabel) ?? null
  const linkHref = ensureString(payload.linkHref) ?? null
  const isEnabled = Boolean(payload.isEnabled)
  const displayOrder = coerceDisplayOrder(payload.displayOrder)

  try {
    const promo = await prisma.promoSection.create({
      data: {
        title,
        description,
        linkLabel,
        linkHref,
        placement,
        isEnabled,
        displayOrder,
      },
    })

    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: "PromoSection",
      entityId: promo.id,
      action: "CREATE",
      diff: buildAuditDiff(null, promo),
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    const message = getPrismaErrorMessage(
      error,
      "Failed to create promo section",
    )
    console.error("[promos] Failed to create promo section", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
