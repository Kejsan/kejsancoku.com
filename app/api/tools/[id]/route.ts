import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { getAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
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

  const id = parseInt(params.id, 10)
  const data = await request.json()
  const existing = await prisma.tool.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
  }

  try {
    const updatedTool = await prisma.tool.update({
      where: { id },
      data: {
        name: data.name,
        url: data.url,
        description: data.description,
      },
    })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "Tool",
      entityId: updatedTool.id,
      action: "UPDATE",
      diff: buildAuditDiff(existing, updatedTool),
    })

    return NextResponse.json(updatedTool)
  } catch (error) {
    console.error("Failed to update tool", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
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

  const id = parseInt(params.id, 10)
  const existing = await prisma.tool.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
  }

  try {
    await prisma.tool.delete({
      where: { id },
    })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "Tool",
      entityId: existing.id,
      action: "DELETE",
      diff: buildAuditDiff(existing, null),
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete tool", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
