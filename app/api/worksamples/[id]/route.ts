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
  const sample = await prisma.workSample.findUnique({ where: { id: Number(params.id) } })
  return NextResponse.json(sample)
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
  const existing = await prisma.workSample.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const updateData: any = {
      ...data,
      published: data.published !== undefined ? data.published : existing.published,
    }
    const sample = await prisma.workSample.update({ where: { id }, data: updateData })
    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: 'WorkSample',
      entityId: sample.id,
      action: 'UPDATE',
      diff: buildAuditDiff(existing, sample),
    })
    return NextResponse.json(sample)
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to update work sample")
    console.error("Failed to update work sample", message, error)
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
  const existing = await prisma.workSample.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    await prisma.workSample.delete({ where: { id } })
    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: 'WorkSample',
      entityId: existing.id,
      action: 'DELETE',
      diff: buildAuditDiff(existing, null),
    })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to delete work sample")
    console.error("Failed to delete work sample", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
