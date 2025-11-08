import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    return NextResponse.json(settings)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2021', 'P2022'].includes(error.code)
    ) {
      console.error('Failed to load site settings in footer API:', error)
      return NextResponse.json(null)
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error(
        'Prisma initialization error while loading site settings in footer API:',
        error,
      )
      return NextResponse.json(null)
    }
    throw error
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const data = await request.json()
  const settings = await prisma.siteSettings.create({ data })
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const data = await request.json()
  const { id, ...rest } = data
  const settings = await prisma.siteSettings.upsert({
    where: { id: id ?? 1 },
    update: rest,
    create: rest,
  })
  return NextResponse.json(settings)
}

export async function DELETE() {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  await prisma.siteSettings.deleteMany()
  return NextResponse.json({ deleted: true })
}
