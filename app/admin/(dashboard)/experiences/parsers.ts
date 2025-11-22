import type { CareerProgression, PreviousRole } from "@/types/experience"

export type ParseResult<T> = { ok: true; data: T } | { ok: false; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normaliseString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined
}

function cleanStringList(values: Iterable<string>): string[] {
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

export function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return cleanStringList(
      value.filter((item): item is string => typeof item === "string"),
    )
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) {
      return []
    }

    if (/^\s*\[/.test(trimmed)) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return cleanStringList(
            parsed.filter((item): item is string => typeof item === "string"),
          )
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Failed to parse string array JSON", error)
        }
      }
    }

    const parts = trimmed
      .split(/\r?\n|,|;|\u2022|\u2023|\u25E6|\u2043|\u2219/)
      .map((part) => part.replace(/^[-*•◦‣∙]+\s*/, ""))

    return cleanStringList(parts)
  }

  if (
    value &&
    typeof value === "object" &&
    "toString" in value &&
    typeof (value as { toString: () => unknown }).toString === "function"
  ) {
    const stringified = (value as { toString: () => unknown }).toString()
    if (typeof stringified === "string" && stringified.trim().length > 0) {
      return coerceStringArray(stringified)
    }
  }

  return []
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
      const responsibilities = coerceStringArray(entry.responsibilities)
      const skills = coerceStringArray(entry.skills)

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

export function formatRolesForForm(value: unknown): string {
  if (!value) {
    return ""
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
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
    const responsibilities = coerceStringArray(entry.responsibilities)
    const skills = coerceStringArray(entry.skills)

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
