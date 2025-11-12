"use server"

import { revalidatePath } from "next/cache"

import {
  experienceFormSchema,
  type ExperienceFormValues,
} from "./schema"
import { serializeExperience } from "./serializers"
import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import { getSafeAdminSession } from "@/lib/safe-session"

type ActionError = {
  ok: false
  message: string
}

type ActionSuccess<T> = {
  ok: true
  data: T
}

type ActionResult<T> = ActionError | ActionSuccess<T>

async function ensureAdminSession(): Promise<ActionError | { email: string | null }> {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return {
      ok: false,
      message: "You are not authorised to perform this action.",
    }
  }

  return { email: sessionResult.session.user.email }
}

export async function createExperience(
  input: ExperienceFormValues,
): Promise<ActionResult<ReturnType<typeof serializeExperience>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = experienceFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  const data = {
    company: parsed.data.company.trim(),
    role: parsed.data.role.trim(),
    startDate: new Date(parsed.data.startDate),
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    description: parsed.data.description?.trim() || null,
  }

  try {
    const experience = await prisma.experience.create({ data })
    await recordAudit({
      actorEmail: session.email,
      entityType: "Experience",
      entityId: experience.id,
      action: "CREATE",
      diff: buildAuditDiff(null, experience),
    })
    revalidatePath("/admin/experiences")

    return { ok: true, data: serializeExperience(experience) }
  } catch (error) {
    console.error("Failed to create experience", error)
    const message = error instanceof Error ? error.message : "Failed to create experience"
    return { ok: false, message }
  }
}

export async function updateExperience(
  id: number,
  input: ExperienceFormValues,
): Promise<ActionResult<ReturnType<typeof serializeExperience>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = experienceFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  const data = {
    company: parsed.data.company.trim(),
    role: parsed.data.role.trim(),
    startDate: new Date(parsed.data.startDate),
    endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    description: parsed.data.description?.trim() || null,
  }

  try {
    const existing = await prisma.experience.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "Experience not found" }
    }

    const experience = await prisma.experience.update({ where: { id }, data })
    await recordAudit({
      actorEmail: session.email,
      entityType: "Experience",
      entityId: experience.id,
      action: "UPDATE",
      diff: buildAuditDiff(existing, experience),
    })
    revalidatePath("/admin/experiences")

    return { ok: true, data: serializeExperience(experience) }
  } catch (error) {
    console.error("Failed to update experience", error)
    const message = error instanceof Error ? error.message : "Failed to update experience"
    return { ok: false, message }
  }
}

export async function deleteExperience(id: number): Promise<ActionResult<{ id: number }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const experience = await prisma.experience.delete({ where: { id } })
    await recordAudit({
      actorEmail: session.email,
      entityType: "Experience",
      entityId: experience.id,
      action: "DELETE",
      diff: buildAuditDiff(experience, null),
    })
    revalidatePath("/admin/experiences")

    return { ok: true, data: { id } }
  } catch (error) {
    console.error("Failed to delete experience", error)
    const message = error instanceof Error ? error.message : "Failed to delete experience"
    return { ok: false, message }
  }
}

export async function duplicateExperience(id: number): Promise<ActionResult<ReturnType<typeof serializeExperience>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const existing = await prisma.experience.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "Experience not found" }
    }

    const copy = await prisma.experience.create({
      data: {
        company: `${existing.company} (Copy)`.trim(),
        role: existing.role,
        startDate: existing.startDate,
        endDate: existing.endDate,
        description: existing.description,
      },
    })

    await recordAudit({
      actorEmail: session.email,
      entityType: "Experience",
      entityId: copy.id,
      action: "CREATE",
      diff: buildAuditDiff(existing, copy),
    })
    revalidatePath("/admin/experiences")

    return { ok: true, data: serializeExperience(copy) }
  } catch (error) {
    console.error("Failed to duplicate experience", error)
    const message = error instanceof Error ? error.message : "Failed to duplicate experience"
    return { ok: false, message }
  }
}

export async function bulkDeleteExperiences(ids: number[]): Promise<ActionResult<{ count: number }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const experiences = await prisma.experience.findMany({ where: { id: { in: ids } } })
    if (experiences.length === 0) {
      return { ok: true, data: { count: 0 } }
    }

    await prisma.experience.deleteMany({ where: { id: { in: ids } } })
    for (const experience of experiences) {
      await recordAudit({
        actorEmail: session.email,
        entityType: "Experience",
        entityId: experience.id,
        action: "DELETE",
        diff: buildAuditDiff(experience, null),
      })
    }

    revalidatePath("/admin/experiences")
    return { ok: true, data: { count: experiences.length } }
  } catch (error) {
    console.error("Failed to delete experiences", error)
    const message = error instanceof Error ? error.message : "Failed to delete experiences"
    return { ok: false, message }
  }
}
