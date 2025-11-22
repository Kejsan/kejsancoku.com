import { z } from "zod"

import { parseCareerProgressionJson, parsePreviousRoleJson } from "./parsers"

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

const stringListField = z.array(z.string().trim().min(1)).default([])

export const experienceFormSchema = z.object({
  company: z.string({ required_error: "Company is required" }).min(1, "Company is required"),
  title: z.string({ required_error: "Title is required" }).min(1, "Title is required"),
  period: z.string().optional(),
  location: z.string().optional(),
  startDate: dateStringSchema,
  endDate: optionalDateStringSchema,
  description: z.string().optional(),
  achievements: stringListField,
  fullDescription: z.string().optional(),
  responsibilities: z.string().optional(),
  skills: stringListField,
  careerProgression: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const result = parseCareerProgressionJson(value)
      if (!result.ok) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message })
      }
    }),
  previousRole: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const result = parsePreviousRoleJson(value)
      if (!result.ok) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message })
      }
    }),
  roles: z.string().optional(), // JSON string for multiple roles within same company
})

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>
