import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { serializeWorkSample } from "./serializers"
import { WorkSamplesShell } from "./_components/work-samples-shell"

export const dynamic = "force-dynamic"

export default async function WorkSamplesPage() {
  if (!prisma) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work samples</h1>
          <p className="text-sm text-muted-foreground">
            Database connection is not configured. Configure DATABASE_URL to manage work samples.
          </p>
        </div>
      </div>
    )
  }

  try {
    const samples = await prisma.workSample.findMany({
      orderBy: { createdAt: "desc" },
    })

    return (
      <WorkSamplesShell initialWorkSamples={samples.map(serializeWorkSample)} />
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      console.warn("[WorkSamplesPage] Prisma client issue", {
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        message: error.message,
      })

      return (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Work samples</h1>
            <p className="text-sm text-muted-foreground">
              Unable to load work samples. Verify your DATABASE_URL and run `pnpm prisma migrate deploy`.
            </p>
          </div>
        </div>
      )
    }

    console.error("[WorkSamplesPage] Unexpected error while loading work samples", error)

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work samples</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading work samples. Check the server logs and try again.
          </p>
        </div>
      </div>
    )
  }
}
