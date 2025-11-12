import { describe, expect, it } from "vitest"

import { buildStatusToggle } from "../status-toggle"

type ToggleSource = Parameters<typeof buildStatusToggle>[0]

const basePost: ToggleSource = {
  status: "DRAFT",
  published: false,
  scheduledAt: null,
  publishedAt: null,
}

describe("buildStatusToggle", () => {
  it("publishes drafts and stamps publishedAt only when missing", () => {
    const now = new Date("2024-01-01T00:00:00.000Z")
    const published = buildStatusToggle(basePost, "published", "admin@example.com", now)

    expect(published).not.toBeNull()
    expect(published).toMatchObject({
      status: "PUBLISHED",
      published: true,
      scheduledAt: null,
      publishedAt: now,
      statusChangedAt: now,
      statusChangedBy: "admin@example.com",
    })

    const preserved = buildStatusToggle(
      { ...basePost, status: "DRAFT", publishedAt: new Date("2023-12-31T12:00:00.000Z") },
      "published",
      "admin@example.com",
      now,
    )

    expect(preserved).not.toBeNull()
    expect(preserved?.publishedAt).toEqual(new Date("2023-12-31T12:00:00.000Z"))
    expect(preserved?.statusChangedAt).toEqual(now)
  })

  it("skips updates for posts already published", () => {
    const now = new Date("2024-01-01T00:00:00.000Z")
    const result = buildStatusToggle(
      { ...basePost, status: "PUBLISHED", published: true, publishedAt: new Date("2023-12-01T00:00:00.000Z") },
      "published",
      "admin@example.com",
      now,
    )

    expect(result).toBeNull()
  })

  it("unpublishes posts and clears timestamps", () => {
    const now = new Date("2024-01-01T00:00:00.000Z")
    const result = buildStatusToggle(
      {
        status: "PUBLISHED",
        published: true,
        scheduledAt: null,
        publishedAt: new Date("2023-12-31T10:00:00.000Z"),
      },
      "draft",
      "admin@example.com",
      now,
    )

    expect(result).not.toBeNull()
    expect(result).toMatchObject({
      status: "DRAFT",
      published: false,
      scheduledAt: null,
      publishedAt: null,
      statusChangedAt: now,
      statusChangedBy: "admin@example.com",
    })
  })

  it("skips unpublish updates for drafts", () => {
    const result = buildStatusToggle(basePost, "draft", "admin@example.com")
    expect(result).toBeNull()
  })

  it("converts scheduled posts to drafts when unpublishing", () => {
    const now = new Date("2024-01-01T00:00:00.000Z")
    const result = buildStatusToggle(
      {
        status: "SCHEDULED",
        published: false,
        scheduledAt: new Date("2024-02-01T00:00:00.000Z"),
        publishedAt: null,
      },
      "draft",
      "admin@example.com",
      now,
    )

    expect(result).not.toBeNull()
    expect(result).toMatchObject({
      status: "DRAFT",
      published: false,
      scheduledAt: null,
      publishedAt: null,
      statusChangedAt: now,
    })
  })
})
