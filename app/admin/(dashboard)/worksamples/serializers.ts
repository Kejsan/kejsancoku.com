import type { WorkSample } from "@prisma/client"

export type SerializedWorkSample = ReturnType<typeof serializeWorkSample>

export function serializeWorkSample(sample: WorkSample) {
  return {
    ...sample,
    published: sample.published ?? true,
    createdAt: sample.createdAt.toISOString(),
    updatedAt: sample.updatedAt.toISOString(),
  }
}
