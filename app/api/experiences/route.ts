import { NextResponse } from "next/server"

import type { Experience } from "@prisma/client"

import { buildAuditDiff, recordAudit } from "@/lib/audit"
import prisma from "@/lib/prisma"
import { getSafeAdminSession } from "@/lib/safe-session"
import {
  normaliseCareerProgressionValue,
  normalisePreviousRoleValue,
} from "@/app/admin/(dashboard)/experiences/parsers"

function ensureString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is string => item.length > 0)
}

function toPublicExperience(experience: Experience) {
  return {
    id: String(experience.id),
    title: experience.title,
    company: experience.company,
    period: experience.period ?? null,
    location: experience.location ?? null,
    description: experience.description ?? null,
    achievements: experience.achievements ?? [],
    fullDescription: experience.fullDescription ?? null,
    responsibilities: experience.responsibilities ?? [],
    skills: experience.skills ?? [],
    careerProgression: normaliseCareerProgressionValue(experience.careerProgression),
    previousRole: normalisePreviousRoleValue(experience.previousRole),
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate ? experience.endDate.toISOString() : null,
  }
}

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const experiences = await prisma.experience.findMany({
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(experiences.map((experience) => toPublicExperience(experience)))
}

export async function POST(request: Request) {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const body = await request.json()
  const company = ensureString(body.company)
  const title = ensureString(body.title)
  const startDateInput = ensureString(body.startDate)

  if (!company || !title || !startDateInput) {
    return NextResponse.json(
      { error: 'company, title, and startDate are required' },
      { status: 400 },
    )
  }

  const startDate = new Date(startDateInput)
  if (Number.isNaN(startDate.valueOf())) {
    return NextResponse.json(
      { error: 'startDate must be a valid date' },
      { status: 400 },
    )
  }

  const endDateInput = ensureString(body.endDate)
  const endDate = endDateInput ? new Date(endDateInput) : null
  if (endDateInput && Number.isNaN(endDate?.valueOf() ?? Number.NaN)) {
    return NextResponse.json(
      { error: 'endDate must be a valid date' },
      { status: 400 },
    )
  }

  const data = {
    company,
    title,
    period: ensureString(body.period) ?? null,
    location: ensureString(body.location) ?? null,
    startDate,
    endDate,
    description: ensureString(body.description) ?? null,
    achievements: ensureStringArray(body.achievements),
    fullDescription: ensureString(body.fullDescription) ?? null,
    responsibilities: ensureStringArray(body.responsibilities),
    skills: ensureStringArray(body.skills),
    careerProgression: normaliseCareerProgressionValue(body.careerProgression),
    previousRole: normalisePreviousRoleValue(body.previousRole),
  }

  try {
    const experience = await prisma.experience.create({ data })
    await recordAudit({
      actorEmail: sessionResult.session.user.email,
      entityType: 'Experience',
      entityId: experience.id,
      action: 'CREATE',
      diff: buildAuditDiff(null, experience),
    })
    return NextResponse.json(toPublicExperience(experience))
  } catch (error) {
    console.error('Failed to create experience', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
