import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"

const MAX_DESCRIPTION_LENGTH = 200

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

function buildPreviewDescription(
  description?: string | null,
  fullDescription?: string | null,
) {
  const source = description || fullDescription
  return source ? truncate(source, MAX_DESCRIPTION_LENGTH) : null
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
      where: { published: true },
      orderBy: [
        { startDate: "desc" },
        { createdAt: "desc" },
      ],
    })

    const payload = experiences.map((experience) => ({
      id: String(experience.id),
      title: experience.title,
      company: experience.company,
      period: experience.period ?? null,
      location: experience.location ?? null,
      description: buildPreviewDescription(
        experience.description,
        experience.fullDescription,
      ),
    }))

    return NextResponse.json(payload)
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to load experiences")
    console.error("Failed to load experiences", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
