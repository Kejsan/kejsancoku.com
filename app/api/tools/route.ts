import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { getAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    console.error("Failed to create tool", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
