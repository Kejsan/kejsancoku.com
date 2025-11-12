import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
import { getAdminSession } from "@/lib/auth"

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const apps = await prisma.webApp.findMany()
  return NextResponse.json(apps)
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const data = await request.json()
  try {
    const app = await prisma.webApp.create({ data })
    await recordAudit({
      actorEmail: session.user.email,
      entityType: "WebApp",
      entityId: app.id,
      action: "CREATE",
      diff: buildAuditDiff(null, app),
    })
    return NextResponse.json(app)
  } catch (error) {
    console.error('Failed to create web app', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
