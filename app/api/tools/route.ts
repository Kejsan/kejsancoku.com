import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { getAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

export async function GET(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }
  
  // Check if this is an admin request
  const url = new URL(request.url)
  const includeUnpublished = url.searchParams.get("admin") === "true"
  
  const tools = await prisma.tool.findMany({
    where: includeUnpublished ? undefined : { published: true },
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
        image: data.image || null,
        blogPostSlug: data.blogPostSlug || null,
        published: data.published !== undefined ? data.published : true,
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
