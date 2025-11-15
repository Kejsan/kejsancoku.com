import { Prisma } from "@prisma/client"

import prisma from "./prisma"

export type AuditAction = "CREATE" | "UPDATE" | "DELETE"

type JsonValue = Prisma.InputJsonValue

export type AuditDiff = (
  & Prisma.InputJsonObject
  & {
    before: JsonValue | null
    after: JsonValue | null
    changes: Record<string, { before: JsonValue | null; after: JsonValue | null }>
  }
)

type JsonRecord = Record<string, JsonValue>

type RecordAuditParams = {
  actorEmail: string | null | undefined
  entityType: string
  entityId: string | number
  action: AuditAction
  diff: AuditDiff
}

function isJsonRecord(value: JsonValue | null): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toPlainJson(value: unknown): JsonValue | null {
  if (value === null || value === undefined) {
    return null
  }

  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue
  } catch (_error) {
    return null
  }
}

function valuesAreEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function buildAuditDiff(before: unknown, after: unknown): AuditDiff {
  const plainBefore = toPlainJson(before)
  const plainAfter = toPlainJson(after)

  const beforeRecord = isJsonRecord(plainBefore) ? plainBefore : ({} as JsonRecord)
  const afterRecord = isJsonRecord(plainAfter) ? plainAfter : ({} as JsonRecord)

  const keys = new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)])

  const changes: Record<string, { before: JsonValue | null; after: JsonValue | null }> = {}

  for (const key of keys) {
    const beforeValue = (beforeRecord[key] ?? null) as JsonValue | null
    const afterValue = (afterRecord[key] ?? null) as JsonValue | null

    if (!valuesAreEqual(beforeValue, afterValue)) {
      changes[key] = { before: beforeValue, after: afterValue }
    }
  }

  return {
    before: plainBefore,
    after: plainAfter,
    changes,
  }
}

export async function recordAudit({
  actorEmail,
  entityType,
  entityId,
  action,
  diff,
}: RecordAuditParams) {
  if (!prisma) {
    console.warn("Prisma client unavailable. Audit entry was not recorded.")
    return
  }

  const email = actorEmail ?? "unknown"

  try {
    await prisma.audit.create({
      data: {
        actorEmail: email,
        entityType,
        entityId: String(entityId),
        action,
        diff,
      },
    })
  } catch (error) {
    console.error("Failed to record audit entry", error)
  }
}

export function isMissingAuditTableError(error: unknown): boolean {
  if (!error) return false

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    typeof error.meta?.entity_name === "string"
  ) {
    return error.meta.entity_name.toLowerCase().includes("audit")
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return typeof error.message === "string" && error.message.includes("Audit")
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes("audit") && error.message.includes("does not exist")
  }

  return false
}
