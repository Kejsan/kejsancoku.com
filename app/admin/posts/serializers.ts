import type { Post } from "@prisma/client"

export type SerializedPost = ReturnType<typeof serializePost>

export function serializePost(post: Post) {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}
