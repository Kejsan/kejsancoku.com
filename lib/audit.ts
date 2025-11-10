import prisma from "./prisma"

export type AuditAction = "CREATE" | "UPDATE" | "DELETE"

export type AuditDiff<T = unknown> = {
  before: T | null
  after: T | null
  changes: Record<string, { before: unknown; after: unknown }>
}

type RecordAuditParams = {
  actorEmail: string | null | undefined
  entityType: string
  entityId: string | number
  action: AuditAction
  diff: AuditDiff
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toPlainObject<T>(value: T): T | null {
  if (value === null || value === undefined) {
    return null
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch (_error) {
    return null
  }
}

function valuesAreEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function buildAuditDiff<TBefore = unknown, TAfter = unknown>(
  before: TBefore | null,
  after: TAfter | null,
): AuditDiff {
  const plainBefore = toPlainObject(before)
  const plainAfter = toPlainObject(after)

  const beforeRecord = isRecord(plainBefore) ? plainBefore : {}
  const afterRecord = isRecord(plainAfter) ? plainAfter : {}

  const keys = new Set([
    ...Object.keys(beforeRecord as Record<string, unknown>),
    ...Object.keys(afterRecord as Record<string, unknown>),
  ])

  const changes: Record<string, { before: unknown; after: unknown }> = {}

  for (const key of keys) {
    const beforeValue = (beforeRecord as Record<string, unknown>)[key]
    const afterValue = (afterRecord as Record<string, unknown>)[key]

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
