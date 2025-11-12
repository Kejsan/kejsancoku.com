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

  const experiences = await prisma.experience.findMany({
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  })

  return <ExperiencesShell initialExperiences={experiences.map(serializeExperience)} />
}
