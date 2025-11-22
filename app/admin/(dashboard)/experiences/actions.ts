"use server"

import { revalidatePath } from "next/cache"

import { Prisma } from "@prisma/client"

import type { CareerProgression, PreviousRole } from "@/types/experience"

import {
  experienceFormSchema,
  type ExperienceFormValues,
} from "./schema"
import { serializeExperience } from "./serializers"
import {
  parseCareerProgressionJson,
  parsePreviousRoleJson,
  splitMultiline,
} from "./parsers"
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

type ExperiencePayload = {
  company: string
  title: string
  period: string | null
  location: string | null
  startDate: Date
  endDate: Date | null
  description: string | null
  achievements: string[]
  fullDescription: string | null
  responsibilities: string[]
  skills: string[]
  careerProgression: CareerProgression[] | null
  previousRole: PreviousRole | null
  roles: any | null
}

function toNullableJsonValue(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (
    value === Prisma.DbNull ||
    value === Prisma.JsonNull ||
    value === Prisma.AnyNull
  ) {
    return value
  }

  if (value === null) {
    return Prisma.DbNull
  }

  if (typeof value === "undefined") {
    return Prisma.DbNull
  }

  return value as Prisma.InputJsonValue
}

function mapExperiencePayloadToPersistence(payload: ExperiencePayload) {
  const { careerProgression, previousRole, roles, ...rest } = payload

  return {
    ...rest,
    careerProgression: toNullableJsonValue(careerProgression),
    previousRole: toNullableJsonValue(previousRole),
    roles: toNullableJsonValue(roles),
  }
}

function sanitizeStringArray(values: readonly string[] | undefined): string[] {
  if (!values) {
    return []
  }

  const result: string[] = []
  const seen = new Set<string>()
  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) {
      continue
    }
    seen.add(trimmed)
    result.push(trimmed)
  }

  return result
}

function buildExperienceData(input: ExperienceFormValues): ActionResult<ExperiencePayload> {
  const achievements = sanitizeStringArray(input.achievements)
  const responsibilities = splitMultiline(input.responsibilities)
  const skills = sanitizeStringArray(input.skills)

  const careerProgressionResult = parseCareerProgressionJson(input.careerProgression)
  if (!careerProgressionResult.ok) {
    return { ok: false, message: careerProgressionResult.message }
  }

  const previousRoleResult = parsePreviousRoleJson(input.previousRole)
  if (!previousRoleResult.ok) {
    return { ok: false, message: previousRoleResult.message }
  }

  // Parse roles JSON if provided
  let rolesData: any = null
  if (input.roles?.trim()) {
    try {
      const parsed = JSON.parse(input.roles.trim())
      if (Array.isArray(parsed)) {
        rolesData = parsed
      }
    } catch {
      // Invalid JSON, will be null
    }
  }

  return {
    ok: true,
    data: {
      company: input.company.trim(),
      title: input.title.trim(),
      period: input.period?.trim() ? input.period.trim() : null,
      location: input.location?.trim() ? input.location.trim() : null,
      startDate: new Date(input.startDate),
      endDate: input.endDate?.trim() ? new Date(input.endDate) : null,
      description: input.description?.trim() ? input.description.trim() : null,
      achievements,
      fullDescription: input.fullDescription?.trim()
        ? input.fullDescription.trim()
        : null,
      responsibilities,
      skills,
      careerProgression: careerProgressionResult.data,
      previousRole: previousRoleResult.data,
      roles: rolesData,
    },
  }
}

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

  const prepared = buildExperienceData(parsed.data)
  if (!prepared.ok) {
    return prepared
  }

  try {
    const experience = await prisma.experience.create({
      data: mapExperiencePayloadToPersistence(prepared.data),
    })
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

  const prepared = buildExperienceData(parsed.data)
  if (!prepared.ok) {
    return prepared
  }

  try {
    const existing = await prisma.experience.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "Experience not found" }
    }

    const experience = await prisma.experience.update({
      where: { id },
      data: mapExperiencePayloadToPersistence(prepared.data),
    })
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

export async function toggleExperiencePublished(
  id: number,
): Promise<ActionResult<ReturnType<typeof serializeExperience>>> {
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

    const experience = await prisma.experience.update({
      where: { id },
      data: { published: !existing.published },
    })
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
    console.error("Failed to toggle experience published", error)
    const message = error instanceof Error ? error.message : "Failed to toggle experience published"
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
        title: existing.title,
        period: existing.period,
        location: existing.location,
        startDate: existing.startDate,
        endDate: existing.endDate,
        description: existing.description,
        achievements: existing.achievements,
        fullDescription: existing.fullDescription,
        responsibilities: existing.responsibilities,
        skills: existing.skills,
        careerProgression: toNullableJsonValue(existing.careerProgression),
        previousRole: toNullableJsonValue(existing.previousRole),
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
