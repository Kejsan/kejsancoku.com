import { NextResponse } from "next/server"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { getAdminSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"
import { normalizeSkillPayload } from "../utils"

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
      { status: 503 },
    )
  }

  const id = Number.parseInt(params.id, 10)
  const existing = Number.isFinite(id)
    ? await prisma.skill.findUnique({ where: { id } })
    : null

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parsed = normalizeSkillPayload(body)

  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  try {
    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: parsed.data,
    })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "Skill",
      entityId: updatedSkill.id,
      action: "UPDATE",
      diff: buildAuditDiff(existing, updatedSkill),
    })

    return NextResponse.json(updatedSkill)
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to update skill")
    console.error("Failed to update skill", message, error)
    return NextResponse.json({ message }, { status: 500 })
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
      { status: 503 },
    )
  }

  const id = Number.parseInt(params.id, 10)
  const existing = Number.isFinite(id)
    ? await prisma.skill.findUnique({ where: { id } })
    : null

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
  }

  try {
    await prisma.skill.delete({ where: { id } })

    await recordAudit({
      actorEmail: session.user.email,
      entityType: "Skill",
      entityId: existing.id,
      action: "DELETE",
      diff: buildAuditDiff(existing, null),
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to delete skill")
    console.error("Failed to delete skill", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
