import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { getAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"
import { normalizeSkillPayload } from "./utils"

export async function GET(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    )
  }

  try {
    // Check if this is an admin request
    const url = new URL(request.url)
    const includeUnpublished = url.searchParams.get("admin") === "true"
    
    const skills = await prisma.skill.findMany({
      where: includeUnpublished ? undefined : { published: true },
      orderBy: [
        { level: "desc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json(skills)
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to load skills")
    console.error("Failed to load skills", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
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
      { status: 503 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = normalizeSkillPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  try {
    const skill = await prisma.skill.create({ data: parsed.data })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "Skill",
      entityId: skill.id,
      action: "CREATE",
      diff: buildAuditDiff(null, skill),
    })

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to create skill")
    console.error("Failed to create skill", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
