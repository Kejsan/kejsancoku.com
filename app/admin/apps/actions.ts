"use server"

import { revalidatePath } from "next/cache"

import { webAppFormSchema, type WebAppFormValues } from "./schema"
import { serializeWebApp } from "./serializers"
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

  return { email: sessionResult.session.user?.email ?? null }
}

export async function createWebApp(
  input: WebAppFormValues,
): Promise<ActionResult<ReturnType<typeof serializeWebApp>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = webAppFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  const data = {
    name: parsed.data.name.trim(),
    url: parsed.data.url && parsed.data.url.trim().length > 0 ? parsed.data.url.trim() : null,
    description: parsed.data.description?.trim() || null,
  }

  try {
    const appRecord = await prisma.webApp.create({ data })
    await recordAudit({
      actorEmail: session.email,
      entityType: "WebApp",
      entityId: appRecord.id,
      action: "CREATE",
      diff: buildAuditDiff(null, appRecord),
    })
    revalidatePath("/admin/apps")

    return { ok: true, data: serializeWebApp(appRecord) }
  } catch (error) {
    console.error("Failed to create app", error)
    const message = error instanceof Error ? error.message : "Failed to create app"
    return { ok: false, message }
  }
}

export async function updateWebApp(
  id: number,
  input: WebAppFormValues,
): Promise<ActionResult<ReturnType<typeof serializeWebApp>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = webAppFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  const data = {
    name: parsed.data.name.trim(),
    url: parsed.data.url && parsed.data.url.trim().length > 0 ? parsed.data.url.trim() : null,
    description: parsed.data.description?.trim() || null,
  }

  try {
    const existing = await prisma.webApp.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "App not found" }
    }

    const appRecord = await prisma.webApp.update({ where: { id }, data })
    await recordAudit({
      actorEmail: session.email,
      entityType: "WebApp",
      entityId: appRecord.id,
      action: "UPDATE",
      diff: buildAuditDiff(existing, appRecord),
    })
    revalidatePath("/admin/apps")

    return { ok: true, data: serializeWebApp(appRecord) }
  } catch (error) {
    console.error("Failed to update app", error)
    const message = error instanceof Error ? error.message : "Failed to update app"
    return { ok: false, message }
  }
}

export async function deleteWebApp(id: number): Promise<ActionResult<{ id: number }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const appRecord = await prisma.webApp.delete({ where: { id } })
    await recordAudit({
      actorEmail: session.email,
      entityType: "WebApp",
      entityId: appRecord.id,
      action: "DELETE",
      diff: buildAuditDiff(appRecord, null),
    })
    revalidatePath("/admin/apps")

    return { ok: true, data: { id } }
  } catch (error) {
    console.error("Failed to delete app", error)
    const message = error instanceof Error ? error.message : "Failed to delete app"
    return { ok: false, message }
  }
}

export async function duplicateWebApp(
  id: number,
): Promise<ActionResult<ReturnType<typeof serializeWebApp>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const existing = await prisma.webApp.findUnique({ where: { id } })
    if (!existing) {
      return { ok: false, message: "App not found" }
    }

    const copy = await prisma.webApp.create({
      data: {
        name: `${existing.name} (Copy)`.trim(),
        url: existing.url,
        description: existing.description,
      },
    })

    await recordAudit({
      actorEmail: session.email,
      entityType: "WebApp",
      entityId: copy.id,
      action: "CREATE",
      diff: buildAuditDiff(existing, copy),
    })
    revalidatePath("/admin/apps")

    return { ok: true, data: serializeWebApp(copy) }
  } catch (error) {
    console.error("Failed to duplicate app", error)
    const message = error instanceof Error ? error.message : "Failed to duplicate app"
    return { ok: false, message }
  }
}

export async function bulkDeleteWebApps(ids: number[]): Promise<ActionResult<{ count: number }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const apps = await prisma.webApp.findMany({ where: { id: { in: ids } } })
    if (apps.length === 0) {
      return { ok: true, data: { count: 0 } }
    }

    await prisma.webApp.deleteMany({ where: { id: { in: ids } } })
    for (const appRecord of apps) {
      await recordAudit({
        actorEmail: session.email,
        entityType: "WebApp",
        entityId: appRecord.id,
        action: "DELETE",
        diff: buildAuditDiff(appRecord, null),
      })
    }

    revalidatePath("/admin/apps")
    return { ok: true, data: { count: apps.length } }
  } catch (error) {
    console.error("Failed to delete apps", error)
    const message = error instanceof Error ? error.message : "Failed to delete apps"
    return { ok: false, message }
  }
}
