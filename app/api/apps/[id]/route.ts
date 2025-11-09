import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

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
  const data = await request.json()
  const app = await prisma.webApp.update({ where: { id: Number(params.id) }, data })
  return NextResponse.json(app)
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
  await prisma.webApp.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ deleted: true })
}
