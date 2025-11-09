import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminSession } from "@/lib/auth"

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
  const newTool = await prisma.tool.create({
    data: {
      name: data.name,
      url: data.url,
      description: data.description,
    },
  })
  return NextResponse.json(newTool, { status: 201 })
}
