import type { WorkSample } from "@prisma/client"

export type SerializedWorkSample = ReturnType<typeof serializeWorkSample>

export function serializeWorkSample(sample: WorkSample) {
  return {
    ...sample,
    createdAt: sample.createdAt.toISOString(),
    updatedAt: sample.updatedAt.toISOString(),
  }
}
