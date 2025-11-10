import type { SiteSettings } from "@prisma/client"

export const SITE_SETTINGS_STRING_FIELDS = [
  "brandName",
  "brandRole",
  "brandDescription",
  "copyright",
  "footerTagline",
  "footerNote",
  "footerCtaLabel",
  "footerCtaHref",
  "linkedin",
  "github",
  "x",
  "threads",
  "email",
  "contactHeadline",
  "contactDescription",
  "contactLocation",
  "contactAvailability",
  "contactCtaLabel",
  "contactCtaHref",
] as const satisfies readonly (keyof SiteSettings)[]

const STRING_FIELD_SET = new Set<string>(SITE_SETTINGS_STRING_FIELDS)

export type SiteSettingsInput = Partial<Pick<SiteSettings, (typeof SITE_SETTINGS_STRING_FIELDS)[number]>>

export function sanitizeSiteSettingsPayload<T extends Record<string, unknown>>(payload: T): SiteSettingsInput {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(payload)) {
    if (!STRING_FIELD_SET.has(key)) {
      continue
    }

    if (typeof value === "string") {
      const trimmed = value.trim()
      sanitized[key] = trimmed.length === 0 ? null : trimmed
      continue
    }

    if (value === "") {
      sanitized[key] = null
      continue
    }

    sanitized[key] = value
  }

  if (typeof sanitized.email === "string") {
    const stripped = sanitized.email.replace(/^mailto:/i, "").trim()
    sanitized.email = stripped.length > 0 ? stripped : null
  }

  for (const field of ["contactCtaHref", "footerCtaHref"] as const) {
    const value = sanitized[field]
    if (typeof value === "string") {
      const trimmed = value.trim()
      sanitized[field] = trimmed.length > 0 ? trimmed : null
    }
  }

  return sanitized as SiteSettingsInput
}

export function toSiteSettingsResponse(settings: SiteSettings | null) {
  return {
    settings,
    lastUpdated: settings?.updatedAt ? settings.updatedAt.toISOString() : null,
  }
}
