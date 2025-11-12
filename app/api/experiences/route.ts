import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
import { getSafeAdminSession } from "@/lib/safe-session"

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const experiences = await prisma.experience.findMany()
  return NextResponse.json(experiences)
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
    const experience = await prisma.experience.create({ data })
    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: 'Experience',
      entityId: experience.id,
      action: 'CREATE',
      diff: buildAuditDiff(null, experience),
    })
    return NextResponse.json(experience)
  } catch (error) {
    console.error('Failed to create experience', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
