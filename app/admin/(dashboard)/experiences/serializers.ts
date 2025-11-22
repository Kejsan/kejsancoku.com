import type { Experience } from "@prisma/client"

import {
  coerceStringArray,
  normaliseCareerProgressionValue,
  normalisePreviousRoleValue,
  formatRolesForForm,
} from "./parsers"

export type SerializedExperience = ReturnType<typeof serializeExperience>

export function serializeExperience(experience: Experience) {
  return {
    ...experience,
    period: experience.period ?? null,
    location: experience.location ?? null,
    achievements: coerceStringArray(experience.achievements),
    fullDescription: experience.fullDescription ?? null,
    responsibilities: coerceStringArray(experience.responsibilities),
    skills: coerceStringArray(experience.skills),
    careerProgression: normaliseCareerProgressionValue(experience.careerProgression),
    previousRole: normalisePreviousRoleValue(experience.previousRole),
    roles: experience.roles,
    published: experience.published ?? true,
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate ? experience.endDate.toISOString() : null,
    createdAt: experience.createdAt.toISOString(),
    updatedAt: experience.updatedAt.toISOString(),
  }
}
