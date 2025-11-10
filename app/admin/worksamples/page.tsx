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

  const samples = await prisma.workSample.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <WorkSamplesShell initialWorkSamples={samples.map(serializeWorkSample)} />
}
