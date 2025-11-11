export const DATETIME_WITH_TIMEZONE = /[zZ]|[+\-]\d{2}:\d{2}$/

/**
 * Normalises a datetime-local form value ("YYYY-MM-DDTHH:mm") to a UTC ISO string.
 * Must run in the browser so the user's local offset is respected when parsing.
 */
export function clientDateTimeToIso(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null

  if (DATETIME_WITH_TIMEZONE.test(trimmed)) {
    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString()
  }

  const withSeconds = trimmed.length === 16 ? `${trimmed}:00` : trimmed
  const parsed = new Date(withSeconds)
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString()
}

export function hasTimezone(value: string) {
  return DATETIME_WITH_TIMEZONE.test(value)
}
