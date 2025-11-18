import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { getPrismaErrorMessage } from "@/lib/prisma-errors"
import { coerceStringArray } from "@/app/admin/(dashboard)/experiences/parsers"

interface PublicSkill {
  name: string
  slug: string
  frequency: number
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
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
      select: { skills: true },
    })

    const skillsMap = new Map<string, PublicSkill>()

    experiences.forEach((experience) => {
      coerceStringArray(experience.skills).forEach((skillName) => {
        const trimmed = skillName.trim()
        if (!trimmed) return

        const slug = toSlug(trimmed)
        const existing = skillsMap.get(slug)

        if (existing) {
          existing.frequency += 1
        } else {
          skillsMap.set(slug, {
            name: trimmed,
            slug,
            frequency: 1,
          })
        }
      })
    })

    const skills = Array.from(skillsMap.values()).sort((a, b) => {
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency
      }
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(skills)
  } catch (error) {
    const message = getPrismaErrorMessage(error, "Failed to load skills")
    console.error("Failed to load skills", message, error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
