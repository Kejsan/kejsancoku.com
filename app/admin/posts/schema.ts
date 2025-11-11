import { z } from "zod"

export const postFormSchema = z.object({
  slug: z
    .string({ required_error: "Slug is required" })
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use letters, numbers, and hyphens only."),
  title: z.string({ required_error: "Title is required" }).min(1, "Title is required"),
  content: z.string().optional(),
  metaDescription: z.string().optional(),
  featuredBanner: z
    .string()
    .url({ message: "Enter a valid URL" })
    .optional()
    .or(z.literal("")),
  published: z.boolean().default(true),
})

export type PostFormValues = z.infer<typeof postFormSchema>
