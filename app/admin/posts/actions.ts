"use server"

import { revalidatePath } from "next/cache"

import type { Post, PostStatus } from "@prisma/client"

import { hasTimezone } from "./date-utils"
import { postFormSchema, type PostFormValues } from "./schema"
import { serializePost } from "./serializers"
import { buildStatusToggle } from "./status-toggle"
import { buildAuditDiff, recordAudit } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import { getSafeAdminSession } from "@/lib/safe-session"

type ActionError = {
  ok: false
  message: string
}

type ActionSuccess<T> = {
  ok: true
  data: T
}

type ActionResult<T> = ActionError | ActionSuccess<T>

function parseOptionalDate(value: string | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (!hasTimezone(trimmed)) {
    throw new Error("Datetime values must include a timezone offset.")
  }
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.valueOf()) ? null : parsed
}

function normalizePostInput(
  input: PostFormValues,
  actorEmail: string | null,
  existing?: Post | null,
) {
  const base = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    content: input.content?.trim() ? input.content.trim() : null,
    metaDescription: input.metaDescription?.trim()
      ? input.metaDescription.trim()
      : null,
    featuredBanner: input.featuredBanner && input.featuredBanner.trim().length > 0
      ? input.featuredBanner.trim()
      : null,
  }

  const now = new Date()
  let status: PostStatus
  let scheduledAt: Date | null = null
  let publishedAt: Date | null = null

  if (input.status === "published") {
    status = "PUBLISHED"
    const provided = parseOptionalDate(input.publishedAt)
    if (existing?.status === "PUBLISHED" && !provided) {
      publishedAt = existing.publishedAt ?? now
    } else {
      publishedAt = provided ?? now
    }
  } else if (input.status === "scheduled") {
    status = "SCHEDULED"
    scheduledAt = parseOptionalDate(input.scheduledAt)
  } else {
    status = "DRAFT"
  }

  if (status !== "SCHEDULED") {
    scheduledAt = null
  }

  if (status !== "PUBLISHED") {
    publishedAt = null
  }

  const statusChanged =
    !existing || existing.status !== status ||
    (status === "SCHEDULED"
      ? existing?.scheduledAt?.getTime() !== scheduledAt?.getTime()
      : false) ||
    (status === "PUBLISHED"
      ? existing?.publishedAt?.getTime() !== publishedAt?.getTime()
      : false)

  return {
    ...base,
    status,
    scheduledAt,
    publishedAt,
    published: status === "PUBLISHED",
    ...(statusChanged
      ? {
          statusChangedAt: now,
          statusChangedBy: actorEmail ?? null,
        }
      : {}),
  }
}

async function ensureAdminSession(): Promise<ActionError | { email: string | null }> {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return {
      ok: false,
      message: "You are not authorised to perform this action.",
    }
  }

  return { email: sessionResult.session.user.email }
}

async function generateDuplicateSlug(slug: string) {
  if (!prisma) return slug

  const baseSlug = slug.endsWith("-copy") ? slug : `${slug}-copy`
  let candidate = baseSlug
  let counter = 1

  while (await prisma.post.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${counter}`
    counter += 1
  }

  return candidate
}

export async function createPost(
  input: PostFormValues,
): Promise<ActionResult<ReturnType<typeof serializePost>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = postFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  const data = normalizePostInput(parsed.data, session.email ?? null)

  try {
    const post = await prisma.post.create({ data })
    await recordAudit({
      actorEmail: session.email,
      entityType: "Post",
      entityId: post.slug,
      action: "CREATE",
      diff: buildAuditDiff(null, post),
    })
    revalidatePath("/admin/posts")

    return { ok: true, data: serializePost(post) }
  } catch (error) {
    console.error("Failed to create post", error)
    const message = error instanceof Error ? error.message : "Failed to create post"
    return { ok: false, message }
  }
}

export async function updatePost(
  slug: string,
  input: PostFormValues,
): Promise<ActionResult<ReturnType<typeof serializePost>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  const parsed = postFormSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid data"
    return { ok: false, message }
  }

  try {
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (!existing) {
      return { ok: false, message: "Post not found" }
    }

    const data = normalizePostInput(parsed.data, session.email ?? null, existing)
    const post = await prisma.post.update({ where: { slug }, data })
    await recordAudit({
      actorEmail: session.email,
      entityType: "Post",
      entityId: post.slug,
      action: "UPDATE",
      diff: buildAuditDiff(existing, post),
    })
    revalidatePath("/admin/posts")

    return { ok: true, data: serializePost(post) }
  } catch (error) {
    console.error("Failed to update post", error)
    const message = error instanceof Error ? error.message : "Failed to update post"
    return { ok: false, message }
  }
}

export async function deletePost(slug: string): Promise<ActionResult<{ slug: string }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const post = await prisma.post.delete({ where: { slug } })
    await recordAudit({
      actorEmail: session.email,
      entityType: "Post",
      entityId: slug,
      action: "DELETE",
      diff: buildAuditDiff(post, null),
    })
    revalidatePath("/admin/posts")
    return { ok: true, data: { slug } }
  } catch (error) {
    console.error("Failed to delete post", error)
    const message = error instanceof Error ? error.message : "Failed to delete post"
    return { ok: false, message }
  }
}

export async function duplicatePost(
  slug: string,
): Promise<ActionResult<ReturnType<typeof serializePost>>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (!existing) {
      return { ok: false, message: "Post not found" }
    }

    const duplicateSlug = await generateDuplicateSlug(existing.slug)
    const duplicated = await prisma.post.create({
      data: {
        slug: duplicateSlug,
        title: `${existing.title} (Copy)`
          .trim()
          .slice(0, 180),
        content: existing.content,
        metaDescription: existing.metaDescription,
        featuredBanner: existing.featuredBanner,
        published: false,
        status: "DRAFT",
        scheduledAt: null,
        publishedAt: null,
        statusChangedAt: new Date(),
        statusChangedBy: session.email ?? null,
      },
    })

    await recordAudit({
      actorEmail: session.email,
      entityType: "Post",
      entityId: duplicated.slug,
      action: "CREATE",
      diff: buildAuditDiff(existing, duplicated),
    })
    revalidatePath("/admin/posts")

    return { ok: true, data: serializePost(duplicated) }
  } catch (error) {
    console.error("Failed to duplicate post", error)
    const message = error instanceof Error ? error.message : "Failed to duplicate post"
    return { ok: false, message }
  }
}

export async function bulkDeletePosts(slugs: string[]): Promise<ActionResult<{ count: number }>> {
  if (!prisma) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  try {
    const posts = await prisma.post.findMany({ where: { slug: { in: slugs } } })
    if (posts.length === 0) {
      return { ok: true, data: { count: 0 } }
    }

    await prisma.post.deleteMany({ where: { slug: { in: slugs } } })
    for (const post of posts) {
      await recordAudit({
        actorEmail: session.email,
        entityType: "Post",
        entityId: post.slug,
        action: "DELETE",
        diff: buildAuditDiff(post, null),
      })
    }

    revalidatePath("/admin/posts")
    return { ok: true, data: { count: posts.length } }
  } catch (error) {
    console.error("Failed to delete posts", error)
    const message = error instanceof Error ? error.message : "Failed to delete posts"
    return { ok: false, message }
  }
}

export async function bulkPublishPosts(
  slugs: string[],
): Promise<ActionResult<{ count: number; posts: ReturnType<typeof serializePost>[] }>> {
  const client = prisma
  if (!client) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  if (slugs.length === 0) {
    return { ok: true, data: { count: 0, posts: [] } }
  }

  try {
    const posts = await client.post.findMany({ where: { slug: { in: slugs } } })
    if (posts.length === 0) {
      return { ok: true, data: { count: 0, posts: [] } }
    }

    const pendingUpdates: {
      original: Post
      data: NonNullable<ReturnType<typeof buildStatusToggle>>
    }[] = []
    for (const post of posts) {
      const data = buildStatusToggle(post, "published", session.email ?? null)
      if (data) {
        pendingUpdates.push({ original: post, data })
      }
    }

    if (pendingUpdates.length === 0) {
      return { ok: true, data: { count: 0, posts: [] } }
    }

    const updated = await client.$transaction(
      pendingUpdates.map(({ original, data }) =>
        client.post.update({
          where: { slug: original.slug },
          data,
        }),
      ),
    )

    await Promise.all(
      updated.map((post, index) =>
        recordAudit({
          actorEmail: session.email,
          entityType: "Post",
          entityId: post.slug,
          action: "UPDATE",
          diff: buildAuditDiff(pendingUpdates[index].original, post),
        }),
      ),
    )

    revalidatePath("/admin/posts")

    return {
      ok: true,
      data: { count: updated.length, posts: updated.map(serializePost) },
    }
  } catch (error) {
    console.error("Failed to publish posts", error)
    const message = error instanceof Error ? error.message : "Failed to publish posts"
    return { ok: false, message }
  }
}

export async function bulkUnpublishPosts(
  slugs: string[],
): Promise<ActionResult<{ count: number; posts: ReturnType<typeof serializePost>[] }>> {
  const client = prisma
  if (!client) {
    return { ok: false, message: "Database is not configured." }
  }

  const session = await ensureAdminSession()
  if (!("email" in session)) {
    return session
  }

  if (slugs.length === 0) {
    return { ok: true, data: { count: 0, posts: [] } }
  }

  try {
    const posts = await client.post.findMany({ where: { slug: { in: slugs } } })
    if (posts.length === 0) {
      return { ok: true, data: { count: 0, posts: [] } }
    }

    const pendingUpdates: {
      original: Post
      data: NonNullable<ReturnType<typeof buildStatusToggle>>
    }[] = []
    for (const post of posts) {
      const data = buildStatusToggle(post, "draft", session.email ?? null)
      if (data) {
        pendingUpdates.push({ original: post, data })
      }
    }

    if (pendingUpdates.length === 0) {
      return { ok: true, data: { count: 0, posts: [] } }
    }

    const updated = await client.$transaction(
      pendingUpdates.map(({ original, data }) =>
        client.post.update({
          where: { slug: original.slug },
          data,
        }),
      ),
    )

    await Promise.all(
      updated.map((post, index) =>
        recordAudit({
          actorEmail: session.email,
          entityType: "Post",
          entityId: post.slug,
          action: "UPDATE",
          diff: buildAuditDiff(pendingUpdates[index].original, post),
        }),
      ),
    )

    revalidatePath("/admin/posts")

    return {
      ok: true,
      data: { count: updated.length, posts: updated.map(serializePost) },
    }
  } catch (error) {
    console.error("Failed to unpublish posts", error)
    const message = error instanceof Error ? error.message : "Failed to unpublish posts"
    return { ok: false, message }
  }
}
