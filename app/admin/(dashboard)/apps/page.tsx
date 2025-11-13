import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { serializeWebApp } from "./serializers"
import { AppsShell } from "./_components/apps-shell"

export const dynamic = "force-dynamic"

export default async function AppsPage() {
  if (!prisma) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          <p className="text-sm text-muted-foreground">
            Database connection is not configured. Configure DATABASE_URL to manage apps.
          </p>
        </div>
      </div>
    )
  }

  try {
    const apps = await prisma.webApp.findMany({
      orderBy: { createdAt: "desc" },
    })

    return <AppsShell initialApps={apps.map(serializeWebApp)} />
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      console.warn("[AppsPage] Prisma client issue", {
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        message: error.message,
      })

      return (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
            <p className="text-sm text-muted-foreground">
              Unable to load apps. Verify your DATABASE_URL and run `pnpm prisma migrate deploy`.
            </p>
          </div>
        </div>
      )
    }

    console.error("[AppsPage] Unexpected error while loading apps", error)

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading apps. Check the server logs and try again.
          </p>
        </div>
      </div>
    )
  }
}
