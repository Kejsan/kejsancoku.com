import { z } from "zod"

const optionalUrl = z
  .string()
  .url({ message: "Enter a valid URL" })
  .optional()
  .or(z.literal(""))

const optionalDateTimeString = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  })
  .refine((value) => {
    if (!value) return true
    const parsed = new Date(value)
    return !Number.isNaN(parsed.valueOf())
  }, "Enter a valid date and time")

export const postFormSchema = z
  .object({
    slug: z
      .string({ required_error: "Slug is required" })
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Use letters, numbers, and hyphens only."),
    title: z
      .string({ required_error: "Title is required" })
      .min(1, "Title is required"),
    content: z.string().optional(),
    metaDescription: z.string().optional(),
    featuredBanner: optionalUrl,
    status: z.enum(["draft", "scheduled", "published"]).default("draft"),
    scheduledAt: optionalDateTimeString,
    publishedAt: optionalDateTimeString,
  })
  .superRefine((data, ctx) => {
    if (data.status === "scheduled") {
      if (!data.scheduledAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledAt"],
          message: "Choose when the post should be published.",
        })
      } else {
        const scheduleDate = new Date(data.scheduledAt)
        if (scheduleDate.valueOf() <= Date.now()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scheduledAt"],
            message: "Scheduled posts must be set in the future.",
          })
        }
      }
    }

    if (data.status === "published" && data.publishedAt) {
      const publishedDate = new Date(data.publishedAt)
      if (publishedDate.valueOf() > Date.now() + 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["publishedAt"],
          message: "Published posts cannot have a publish date in the future.",
        })
      }
    }
  })

export type PostFormValues = z.infer<typeof postFormSchema>
