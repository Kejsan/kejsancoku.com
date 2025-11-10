import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildAuditDiff, recordAudit } from '@/lib/audit'

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const experiences = await prisma.experience.findMany()
  return NextResponse.json(experiences)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const data = await request.json()
  try {
    const experience = await prisma.experience.create({ data })
    await recordAudit({
      actorEmail: session.user?.email,
      entityType: 'Experience',
      entityId: experience.id,
      action: 'CREATE',
      diff: buildAuditDiff(null, experience),
    })
    return NextResponse.json(experience)
  } catch (error) {
    console.error('Failed to create experience', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
