import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import { getSafeAdminSession } from "@/lib/safe-session"

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const experience = await prisma.experience.findUnique({ where: { id: Number(params.id) } })
  return NextResponse.json(experience)
}

export async function PUT(request: Request, { params }: Params) {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const id = Number(params.id)
  const data = await request.json()
  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const experience = await prisma.experience.update({ where: { id }, data })
    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: 'Experience',
      entityId: experience.id,
      action: 'UPDATE',
      diff: buildAuditDiff(existing, experience),
    })
    return NextResponse.json(experience)
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to update experience")
    console.error("Failed to update experience", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const id = Number(params.id)
  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    await prisma.experience.delete({ where: { id } })
    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: 'Experience',
      entityId: existing.id,
      action: 'DELETE',
      diff: buildAuditDiff(existing, null),
    })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to delete experience")
    console.error("Failed to delete experience", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
