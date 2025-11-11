import { z } from "zod"

export const workSampleFormSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(1, "Title is required"),
  url: z
    .string()
    .url({ message: "Enter a valid URL" })
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
})

export type WorkSampleFormValues = z.infer<typeof workSampleFormSchema>
