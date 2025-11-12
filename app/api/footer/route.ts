import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { getAdminSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeSiteSettingsPayload, toSiteSettingsResponse } from "@/lib/site-settings"

export async function GET() {
  if (!prisma) {
    console.warn("Prisma client unavailable for footer GET request.")
    return NextResponse.json(toSiteSettingsResponse(null), { status: 503 })
  }
  try {
    const settings = await prisma.siteSettings.findFirst()
    return NextResponse.json(toSiteSettingsResponse(settings))
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P2021", "P2022"].includes(error.code)
    ) {
      console.error("Failed to load site settings in footer API:", error)
      return NextResponse.json(toSiteSettingsResponse(null))
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error(
        "Prisma initialization error while loading site settings in footer API:",
        error,
      )
      return NextResponse.json(toSiteSettingsResponse(null))
    }
    throw error
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }
  const payload = await request.json()
  const { id: _ignoredId, createdAt: _ignoredCreatedAt, updatedAt: _ignoredUpdatedAt, ...rawData } = payload
  const sanitized = sanitizeSiteSettingsPayload(rawData)
  const updateData = sanitized as Prisma.SiteSettingsUpdateInput
  const createData = sanitized as Prisma.SiteSettingsCreateInput
  try {
    const { record, previous, action } = await prisma.$transaction(async (tx) => {
      const existing = await tx.siteSettings.findFirst()
      if (existing) {
        const updated = await tx.siteSettings.update({
          where: { id: existing.id },
          data: updateData,
        })
        return { record: updated, previous: existing, action: "UPDATE" as const }
      }
      const created = await tx.siteSettings.create({ data: createData })
      return { record: created, previous: null, action: "CREATE" as const }
    })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "SiteSettings",
      entityId: record.id,
      action,
      diff: buildAuditDiff(previous, record),
    })

    return NextResponse.json(toSiteSettingsResponse(record))
  } catch (error) {
    console.error("Failed to persist site settings in footer POST API:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse("Invalid site settings payload", { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }
  const payload = await request.json()
  const { id: _ignoredId, createdAt: _ignoredCreatedAt, updatedAt: _ignoredUpdatedAt, ...rawData } = payload
  const sanitized = sanitizeSiteSettingsPayload(rawData)
  const updateData = sanitized as Prisma.SiteSettingsUpdateInput
  const createData = sanitized as Prisma.SiteSettingsCreateInput
  try {
    const { record, previous, action } = await prisma.$transaction(async (tx) => {
      const existing = await tx.siteSettings.findFirst()
      if (existing) {
        const updated = await tx.siteSettings.update({
          where: { id: existing.id },
          data: updateData,
        })
        return { record: updated, previous: existing, action: "UPDATE" as const }
      }
      const created = await tx.siteSettings.create({ data: createData })
      return { record: created, previous: null, action: "CREATE" as const }
    })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "SiteSettings",
      entityId: record.id,
      action,
      diff: buildAuditDiff(previous, record),
    })

    return NextResponse.json(toSiteSettingsResponse(record))
  } catch (error) {
    console.error("Failed to persist site settings in footer PUT API:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse("Invalid site settings payload", { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE() {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }
  try {
    const existing = await prisma.siteSettings.findMany()
    if (existing.length === 0) {
      return new NextResponse("Not Found", { status: 404 })
    }

    await prisma.siteSettings.deleteMany()

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "SiteSettings",
      entityId: "SiteSettings",
      action: "DELETE",
      diff: buildAuditDiff(existing, null),
    })

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("Failed to delete site settings in footer DELETE API:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
