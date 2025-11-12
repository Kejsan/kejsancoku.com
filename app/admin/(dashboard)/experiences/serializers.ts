import type { Experience } from "@prisma/client"

export type SerializedExperience = ReturnType<typeof serializeExperience>

export function serializeExperience(experience: Experience) {
  return {
    ...experience,
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate ? experience.endDate.toISOString() : null,
    createdAt: experience.createdAt.toISOString(),
    updatedAt: experience.updatedAt.toISOString(),
  }
}
