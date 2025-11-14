import type { CareerProgression, PreviousRole } from "@/types/experience"

export type ParseResult<T> = { ok: true; data: T } | { ok: false; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normaliseString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined
}

function normaliseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is string => item.length > 0)
}

export function splitMultiline(value: string | null | undefined): string[] {
  if (!value) {
    return []
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function parseCareerProgressionJson(
  value: string | null | undefined,
): ParseResult<CareerProgression[] | null> {
  if (!value || value.trim().length === 0) {
    return { ok: true, data: null }
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) {
      return { ok: false, message: "Career progression must be a JSON array" }
    }

    const items: CareerProgression[] = []
    for (const entry of parsed) {
      if (!isRecord(entry)) {
        return { ok: false, message: "Career progression entries must be objects" }
      }

      const title = normaliseString(entry.title)
      const period = normaliseString(entry.period)
      const type = normaliseString(entry.type) ?? "standard"
      const description = normaliseString(entry.description) ?? ""
      const responsibilities = normaliseStringArray(entry.responsibilities)
      const skills = normaliseStringArray(entry.skills)

      if (!title || !period) {
        return {
          ok: false,
          message: "Career progression entries require a title and period",
        }
      }

      items.push({
        title,
        period,
        type,
        description,
        responsibilities,
        skills,
      })
    }

    return { ok: true, data: items.length > 0 ? items : null }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON for career progression"
    return { ok: false, message }
  }
}

export function parsePreviousRoleJson(
  value: string | null | undefined,
): ParseResult<PreviousRole | null> {
  if (!value || value.trim().length === 0) {
    return { ok: true, data: null }
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!isRecord(parsed)) {
      return { ok: false, message: "Previous role must be a JSON object" }
    }

    const title = normaliseString(parsed.title)
    const period = normaliseString(parsed.period)
    const note = normaliseString(parsed.note)

    if (!title || !period) {
      return {
        ok: false,
        message: "Previous role requires a title and period",
      }
    }

    return {
      ok: true,
      data: note ? { title, period, note } : { title, period },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON for previous role"
    return { ok: false, message }
  }
}

export function formatCareerProgressionForForm(
  value: CareerProgression[] | null | undefined,
): string {
  if (!value || value.length === 0) {
    return ""
  }
  return JSON.stringify(value, null, 2)
}

export function formatPreviousRoleForForm(value: PreviousRole | null | undefined): string {
  if (!value) {
    return ""
  }
  return JSON.stringify(value, null, 2)
}

export function formatMultilineForForm(value: readonly string[] | null | undefined): string {
  if (!value || value.length === 0) {
    return ""
  }
  return value.join("\n")
}

export function normaliseCareerProgressionValue(
  value: unknown,
): CareerProgression[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const items: CareerProgression[] = []
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue
    }

    const title = normaliseString(entry.title)
    const period = normaliseString(entry.period)
    const type = normaliseString(entry.type) ?? "standard"
    const description = normaliseString(entry.description) ?? ""
    const responsibilities = normaliseStringArray(entry.responsibilities)
    const skills = normaliseStringArray(entry.skills)

    if (!title || !period) {
      continue
    }

    items.push({
      title,
      period,
      type,
      description,
      responsibilities,
      skills,
    })
  }

  return items.length > 0 ? items : null
}

export function normalisePreviousRoleValue(value: unknown): PreviousRole | null {
  if (!isRecord(value)) {
    return null
  }

  const title = normaliseString(value.title)
  const period = normaliseString(value.period)
  const note = normaliseString(value.note)

  if (!title || !period) {
    return null
  }

  return note ? { title, period, note } : { title, period }
}
