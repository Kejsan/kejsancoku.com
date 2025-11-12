import type { Post, PostStatus } from "@prisma/client"

type LowercaseStatus = Lowercase<PostStatus>

export type SerializedPost = ReturnType<typeof serializePost>

function toOptionalISOString(value: Date | null): string | null {
  return value ? value.toISOString() : null
}

export function serializePost(post: Post) {
  return {
    ...post,
    status: post.status.toLowerCase() as LowercaseStatus,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: toOptionalISOString(post.publishedAt ?? null),
    scheduledAt: toOptionalISOString(post.scheduledAt ?? null),
    statusChangedAt: post.statusChangedAt.toISOString(),
  }
}
