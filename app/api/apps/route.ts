import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import { getAdminSession } from "@/lib/auth"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const apps = await prisma.webApp.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(apps)
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: SUPABASE_CONFIG_ERROR_MESSAGE },
      { status: 503 },
    )
  }

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
    const message = getPrismaErrorMessage(error, "Failed to create web app")
    console.error("Failed to create web app", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
