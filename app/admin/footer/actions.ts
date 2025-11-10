"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getAdminSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeSiteSettingsPayload, toSiteSettingsResponse } from "@/lib/site-settings"
import type { Prisma } from "@prisma/client"

function isValidUrl(value: string) {
  if (value.length === 0) {
    return true
  }
  if (value.startsWith("/") || value.startsWith("#")) {
    return true
  }
  if (value.toLowerCase().startsWith("mailto:")) {
    const email = value.slice(7)
    return z.string().email().safeParse(email).success
  }
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}

const optionalTextField = (label: string, max = 500) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value ?? "")
    .refine((value) => value.length <= max, {
      message: `${label} must be ${max} characters or less`,
    })

const optionalUrlField = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value ?? "")
    .refine((value) => value.length === 0 || isValidUrl(value), {
      message: `Enter a valid ${label} URL`,
    })

const emailField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value ?? "")
  .refine((value) => value.length === 0 || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address",
  })

export const footerFormSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(2, "Brand name must be at least 2 characters long")
    .max(100, "Brand name must be 100 characters or less"),
  brandRole: optionalTextField("role", 120),
  brandDescription: optionalTextField("description"),
  linkedin: optionalUrlField("LinkedIn"),
  github: optionalUrlField("GitHub"),
  x: optionalUrlField("X"),
  threads: optionalUrlField("Threads"),
  email: emailField,
  contactHeadline: optionalTextField("contact headline", 160),
  contactDescription: optionalTextField("contact description"),
  contactLocation: optionalTextField("contact location", 160),
  contactAvailability: optionalTextField("contact availability", 160),
  contactCtaLabel: optionalTextField("contact call-to-action label", 120),
  contactCtaHref: optionalUrlField("contact call-to-action"),
  footerTagline: optionalTextField("footer tagline", 160),
  footerCtaLabel: optionalTextField("footer call-to-action label", 120),
  footerCtaHref: optionalUrlField("footer call-to-action"),
  footerNote: optionalTextField("footer note"),
  copyright: optionalTextField("copyright", 200),
})

export type FooterFormValues = z.infer<typeof footerFormSchema>

export const emptyFooterFormValues: FooterFormValues = {
  brandName: "Kejsan",
  brandRole: "",
  brandDescription: "",
  linkedin: "",
  github: "",
  x: "",
  threads: "",
  email: "",
  contactHeadline: "",
  contactDescription: "",
  contactLocation: "",
  contactAvailability: "",
  contactCtaLabel: "",
  contactCtaHref: "",
  footerTagline: "",
  footerCtaLabel: "",
  footerCtaHref: "",
  footerNote: "",
  copyright: "",
}

export async function saveFooterSettings(values: FooterFormValues) {
  const session = await getAdminSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  if (!prisma) {
    throw new Error("Database not configured")
  }

  const parsed = footerFormSchema.safeParse(values)

  if (!parsed.success) {
    throw new Error("Invalid footer settings")
  }

  const sanitized = sanitizeSiteSettingsPayload(parsed.data)
  const updateData = sanitized as Prisma.SiteSettingsUpdateInput
  const createData = sanitized as Prisma.SiteSettingsCreateInput

  const settings = await prisma.$transaction(async (tx) => {
    const existing = await tx.siteSettings.findFirst()
    if (existing) {
      return tx.siteSettings.update({ where: { id: existing.id }, data: updateData })
    }
    return tx.siteSettings.create({ data: createData })
  })

  revalidatePath("/")
  revalidatePath("/work-samples")
  revalidatePath("/blog")
  revalidatePath("/admin/footer")

  return toSiteSettingsResponse(settings)
}
