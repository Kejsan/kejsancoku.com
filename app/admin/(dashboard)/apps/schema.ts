import { z } from "zod"

const optionalUrl = z
  .string()
  .url({ message: "Enter a valid URL" })
  .optional()
  .or(z.literal(""))

export const webAppFormSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name is required"),
  url: optionalUrl,
  description: z.string().optional(),
  image: optionalUrl,
  blogPostSlug: z.string().optional(),
})

export type WebAppFormValues = z.infer<typeof webAppFormSchema>
