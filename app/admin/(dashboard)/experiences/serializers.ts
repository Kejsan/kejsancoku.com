import type { Experience } from "@prisma/client"

import {
  normaliseCareerProgressionValue,
  normalisePreviousRoleValue,
} from "./parsers"

export type SerializedExperience = ReturnType<typeof serializeExperience>

export function serializeExperience(experience: Experience) {
  return {
    ...experience,
    period: experience.period ?? null,
    location: experience.location ?? null,
    achievements: experience.achievements ?? [],
    fullDescription: experience.fullDescription ?? null,
    responsibilities: experience.responsibilities ?? [],
    skills: experience.skills ?? [],
    careerProgression: normaliseCareerProgressionValue(experience.careerProgression),
    previousRole: normalisePreviousRoleValue(experience.previousRole),
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate ? experience.endDate.toISOString() : null,
    createdAt: experience.createdAt.toISOString(),
    updatedAt: experience.updatedAt.toISOString(),
  }
}
