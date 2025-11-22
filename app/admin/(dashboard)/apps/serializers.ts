import type { WebApp } from "@prisma/client"

export type SerializedWebApp = ReturnType<typeof serializeWebApp>

export function serializeWebApp(app: WebApp) {
  return {
    ...app,
    published: app.published ?? true,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  }
}
