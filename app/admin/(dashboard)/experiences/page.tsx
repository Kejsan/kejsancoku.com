import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { serializeExperience } from "./serializers"
import { ExperiencesShell } from "./_components/experiences-shell"

export const dynamic = "force-dynamic"

export default async function ExperiencesPage() {
  if (!prisma) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiences</h1>
          <p className="text-sm text-muted-foreground">
            Database connection is not configured. Configure DATABASE_URL to manage experiences.
          </p>
        </div>
      </div>
    )
  }

  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
    })

    return (
      <ExperiencesShell initialExperiences={experiences.map(serializeExperience)} />
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      console.warn("[ExperiencesPage] Prisma client issue", {
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        message: error.message,
      })

      return (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Experiences</h1>
            <p className="text-sm text-muted-foreground">
              Unable to load experiences. Verify your DATABASE_URL and run `pnpm prisma migrate deploy`.
            </p>
          </div>
        </div>
      )
    }

    console.error(
      "[ExperiencesPage] Unexpected error while loading experiences",
      error,
    )

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiences</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading experiences. Check the server logs and try again.
          </p>
        </div>
      </div>
    )
  }
}
