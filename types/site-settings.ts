import type { SiteSettings } from "@prisma/client"

export type SiteSettingsResponse = {
  settings: SiteSettings | null
  lastUpdated: string | null
}
