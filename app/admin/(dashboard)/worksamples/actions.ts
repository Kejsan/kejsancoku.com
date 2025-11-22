"use server"

import { revalidatePath } from "next/cache"

import { workSampleFormSchema, type WorkSampleFormValues } from "./schema"
import { serializeWorkSample } from "./serializers"
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

export async function createWorkSample(
  input: WorkSampleFormValues,
): Promise<ActionResult<ReturnType<typeof serializeWorkSample>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = workSampleFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  const data = {
    title: parsed.data.title.trim(),
    url: parsed.data.url && parsed.data.url.trim().length > 0 ? parsed.data.url.trim() : null,
    description: parsed.data.description?.trim() || null,
    published: true,
  }

  try {
    const sample = await prisma.workSample.create({ data })
    await recordAudit({
      actorEmail: session.email,
      entityType: "WorkSample",
      entityId: sample.id,
      action: "CREATE",
      diff: buildAuditDiff(null, sample),
    })
    revalidatePath("/admin/worksamples")

    return { ok: true, data: serializeWorkSample(sample) }
  } catch (error) {
    console.error("Failed to create work sample", error)
    const message = error instanceof Error ? error.message : "Failed to create work sample"
    return { ok: false, message }
  }
}

export async function updateWorkSample(
  id: number,
  input: WorkSampleFormValues,
): Promise<ActionResult<ReturnType<typeof serializeWorkSample>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = workSampleFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  const data = {
    title: parsed.data.title.trim(),
    url: parsed.data.url && parsed.data.url.trim().length > 0 ? parsed.data.url.trim() : null,
    description: parsed.data.description?.trim() || null,
  }

  try {
    const existing = await prisma.workSample.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "Work sample not found" }
    }

    const updateData = {
      ...data,
      published: existing.published,
    }
    const sample = await prisma.workSample.update({ where: { id }, data: updateData })
    await recordAudit({
      actorEmail: session.email,
      entityType: "WorkSample",
      entityId: sample.id,
      action: "UPDATE",
      diff: buildAuditDiff(existing, sample),
    })
    revalidatePath("/admin/worksamples")

    return { ok: true, data: serializeWorkSample(sample) }
  } catch (error) {
    console.error("Failed to update work sample", error)
    const message = error instanceof Error ? error.message : "Failed to update work sample"
    return { ok: false, message }
  }
}

export async function deleteWorkSample(id: number): Promise<ActionResult<{ id: number }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const sample = await prisma.workSample.delete({ where: { id } })
    await recordAudit({
      actorEmail: session.email,
      entityType: "WorkSample",
      entityId: sample.id,
      action: "DELETE",
      diff: buildAuditDiff(sample, null),
    })
    revalidatePath("/admin/worksamples")

    return { ok: true, data: { id } }
  } catch (error) {
    console.error("Failed to delete work sample", error)
    const message = error instanceof Error ? error.message : "Failed to delete work sample"
    return { ok: false, message }
  }
}

export async function duplicateWorkSample(
  id: number,
): Promise<ActionResult<ReturnType<typeof serializeWorkSample>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const existing = await prisma.workSample.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "Work sample not found" }
    }

    const copy = await prisma.workSample.create({
      data: {
        title: `${existing.title} (Copy)`.trim(),
        url: existing.url,
        description: existing.description,
        published: existing.published ?? true,
      },
    })

    await recordAudit({
      actorEmail: session.email,
      entityType: "WorkSample",
      entityId: copy.id,
      action: "CREATE",
      diff: buildAuditDiff(existing, copy),
    })
    revalidatePath("/admin/worksamples")

    return { ok: true, data: serializeWorkSample(copy) }
  } catch (error) {
    console.error("Failed to duplicate work sample", error)
    const message = error instanceof Error ? error.message : "Failed to duplicate work sample"
    return { ok: false, message }
  }
}

export async function toggleWorkSamplePublished(
  id: number,
): Promise<ActionResult<ReturnType<typeof serializeWorkSample>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const existing = await prisma.workSample.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "Work sample not found" }
    }

    const sample = await prisma.workSample.update({
      where: { id },
      data: { published: !existing.published },
    })
    await recordAudit({
      actorEmail: session.email,
      entityType: "WorkSample",
      entityId: sample.id,
      action: "UPDATE",
      diff: buildAuditDiff(existing, sample),
    })
    revalidatePath("/admin/worksamples")

    return { ok: true, data: serializeWorkSample(sample) }
  } catch (error) {
    console.error("Failed to toggle work sample published", error)
    const message = error instanceof Error ? error.message : "Failed to toggle work sample published"
    return { ok: false, message }
  }
}

export async function bulkDeleteWorkSamples(ids: number[]): Promise<ActionResult<{ count: number }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const samples = await prisma.workSample.findMany({ where: { id: { in: ids } } })
    if (samples.length === 0) {
      return { ok: true, data: { count: 0 } }
    }

    await prisma.workSample.deleteMany({ where: { id: { in: ids } } })
    for (const sample of samples) {
      await recordAudit({
        actorEmail: session.email,
        entityType: "WorkSample",
        entityId: sample.id,
        action: "DELETE",
        diff: buildAuditDiff(sample, null),
      })
    }

    revalidatePath("/admin/worksamples")
    return { ok: true, data: { count: samples.length } }
  } catch (error) {
    console.error("Failed to delete work samples", error)
    const message = error instanceof Error ? error.message : "Failed to delete work samples"
    return { ok: false, message }
  }
}
