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
  const samples = await prisma.workSample.findMany()
  return NextResponse.json(samples)
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
    const sample = await prisma.workSample.create({ data })
    await recordAudit({
      actorEmail: session.user?.email,
      entityType: 'WorkSample',
      entityId: sample.id,
      action: 'CREATE',
      diff: buildAuditDiff(null, sample),
    })
    return NextResponse.json(sample)
  } catch (error) {
    console.error('Failed to create work sample', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
