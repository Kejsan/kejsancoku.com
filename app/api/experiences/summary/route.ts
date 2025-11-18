import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"

function formatExperienceSummary(experience: {
  id: number
  title: string
  company: string
  period: string | null
  location: string | null
  description: string | null
}) {
  return {
    id: String(experience.id),
    title: experience.title,
    company: experience.company,
    period: experience.period,
    location: experience.location,
    description: experience.description,
  }
}

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    )
  }

  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        company: true,
        period: true,
        location: true,
        description: true,
      },
    })

    return NextResponse.json(experiences.map(formatExperienceSummary))
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to load experiences summary")
    console.error("Failed to load experiences summary", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
