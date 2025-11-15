import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import { getSafeAdminSession } from "@/lib/safe-session"

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const samples = await prisma.workSample.findMany()
  return NextResponse.json(samples)
}

export async function POST(request: Request) {
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
  const data = await request.json()
  try {
    const sample = await prisma.workSample.create({ data })
    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: 'WorkSample',
      entityId: sample.id,
      action: 'CREATE',
      diff: buildAuditDiff(null, sample),
    })
    return NextResponse.json(sample)
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to create work sample")
    console.error("Failed to create work sample", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
