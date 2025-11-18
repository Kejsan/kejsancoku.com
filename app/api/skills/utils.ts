function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function normalizeSkillPayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "Invalid request body" } as const
  }

  const data = body as Record<string, unknown>

  const name = typeof data.name === "string" ? data.name.trim() : ""
  if (!name) {
    return { ok: false, message: "Name is required" } as const
  }

  const slugSource =
    typeof data.slug === "string" && data.slug.trim().length > 0
      ? data.slug
      : name

  const slug = toSlug(slugSource)
  if (!slug) {
    return { ok: false, message: "Slug could not be generated" } as const
  }

  const description =
    typeof data.description === "string" && data.description.trim().length > 0
      ? data.description.trim()
      : null

  const icon =
    typeof data.icon === "string" && data.icon.trim().length > 0
      ? data.icon.trim()
      : null

  const category =
    typeof data.category === "string" && data.category.trim().length > 0
      ? data.category.trim()
      : null

  const parsedLevel = Number(data.level)
  const level = Number.isFinite(parsedLevel) ? Math.max(1, Math.min(5, parsedLevel)) : 3

  return {
    ok: true as const,
    data: {
      name,
      slug,
      description,
      icon,
      level,
      category,
    },
  }
}
