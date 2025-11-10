import { z } from "zod"

const dateStringSchema = z
  .string({ required_error: "Start date is required" })
  .min(1, "Start date is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date",
  })

const optionalDateStringSchema = z
  .string()
  .optional()
  .refine((value) => {
    if (!value) return true
    return !Number.isNaN(Date.parse(value))
  }, "Enter a valid date")

export const experienceFormSchema = z.object({
  company: z.string({ required_error: "Company is required" }).min(1, "Company is required"),
  role: z.string({ required_error: "Role is required" }).min(1, "Role is required"),
  startDate: dateStringSchema,
  endDate: optionalDateStringSchema,
  description: z.string().optional(),
})

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>
