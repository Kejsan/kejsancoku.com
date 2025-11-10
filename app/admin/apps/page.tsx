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

  const apps = await prisma.webApp.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <AppsShell initialApps={apps.map(serializeWebApp)} />
}
