import { NextResponse } from "next/server"
import { PromoPlacement } from "@prisma/client"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
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

  const id = Number.parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const promo = await prisma.promoSection.findUnique({ where: { id } })
  if (!promo) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return NextResponse.json(promo)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

  const id = Number.parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = await prisma.promoSection.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
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
    const promo = await prisma.promoSection.update({
      where: { id },
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
      action: "UPDATE",
      diff: buildAuditDiff(existing, promo),
    })

    return NextResponse.json(promo)
  } catch (error) {
    console.error("[promos] Failed to update promo section", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
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

  const id = Number.parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const existing = await prisma.promoSection.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
  }

  try {
    await prisma.promoSection.delete({ where: { id } })

    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: "PromoSection",
      entityId: existing.id,
      action: "DELETE",
      diff: buildAuditDiff(existing, null),
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[promos] Failed to delete promo section", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
