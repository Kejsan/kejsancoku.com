import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { getAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }
  const tools = await prisma.tool.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })
  return NextResponse.json(tools)
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
    return new NextResponse(null, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  const data = await request.json()
  try {
    const newTool = await prisma.tool.create({
      data: {
        name: data.name,
        url: data.url,
        description: data.description,
      },
    })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "Tool",
      entityId: newTool.id,
      action: "CREATE",
      diff: buildAuditDiff(null, newTool),
    })

    return NextResponse.json(newTool, { status: 201 })
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to create tool")
    console.error("Failed to create tool", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
