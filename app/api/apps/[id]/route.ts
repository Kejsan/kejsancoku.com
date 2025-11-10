import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { buildAuditDiff, recordAudit } from '@/lib/audit'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const app = await prisma.webApp.findUnique({ where: { id: Number(params.id) } })
  return NextResponse.json(app)
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const id = Number(params.id)
  const data = await request.json()
  const existing = await prisma.webApp.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const app = await prisma.webApp.update({ where: { id }, data })
    await recordAudit({
      actorEmail: session.user?.email,
      entityType: 'WebApp',
      entityId: app.id,
      action: 'UPDATE',
      diff: buildAuditDiff(existing, app),
    })
    return NextResponse.json(app)
  } catch (error) {
    console.error('Failed to update web app', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const id = Number(params.id)
  const existing = await prisma.webApp.findUnique({ where: { id } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    await prisma.webApp.delete({ where: { id } })
    await recordAudit({
      actorEmail: session.user?.email,
      entityType: 'WebApp',
      entityId: existing.id,
      action: 'DELETE',
      diff: buildAuditDiff(existing, null),
    })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Failed to delete web app', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
