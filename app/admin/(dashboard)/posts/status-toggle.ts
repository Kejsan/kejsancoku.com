import type { Post, PostStatus, Prisma } from "@prisma/client"

type ToggleTarget = "draft" | "published"

type ToggleSource = Pick<Post, "status" | "published" | "publishedAt" | "scheduledAt">

export function buildStatusToggle(
  post: ToggleSource,
  target: ToggleTarget,
  actorEmail: string | null,
  now: Date = new Date(),
): Prisma.PostUpdateInput | null {
  if (target === "published") {
    const alreadyPublished = post.status === "PUBLISHED" || post.published
    if (alreadyPublished) {
      return null
    }

    return {
      status: "PUBLISHED" as PostStatus,
      published: true,
      scheduledAt: null,
      publishedAt: post.publishedAt ?? now,
      statusChangedAt: now,
      statusChangedBy: actorEmail ?? null,
    }
  }

  const alreadyDraft = post.status === "DRAFT" && !post.published
  if (alreadyDraft) {
    return null
  }

  return {
    status: "DRAFT" as PostStatus,
    published: false,
    scheduledAt: null,
    publishedAt: null,
    statusChangedAt: now,
    statusChangedBy: actorEmail ?? null,
  }
}
