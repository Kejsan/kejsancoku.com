import { z } from "zod"

export const webAppFormSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name is required"),
  url: z
    .string()
    .url({ message: "Enter a valid URL" })
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
})

export type WebAppFormValues = z.infer<typeof webAppFormSchema>
