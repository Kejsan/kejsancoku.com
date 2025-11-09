import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

function normalizeSiteSettingsPayload<T extends Record<string, any>>(payload: T): T {
  const normalized: Record<string, any> = { ...payload }
  const email = normalized.email
  if (typeof email === 'string') {
    const sanitized = email.replace(/^mailto:/i, '').trim()
    if (sanitized) {
      normalized.email = sanitized
    } else {
      normalized.email = null
    }
  }
  return normalized as T
}

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
  const payload = await request.json()
  const { id: _ignoredId, ...rawData } = payload
  const data = normalizeSiteSettingsPayload(rawData)
  try {
    const settings = await prisma.$transaction(async (tx) => {
      const existing = await tx.siteSettings.findFirst()
      if (existing) {
        return tx.siteSettings.update({
          where: { id: existing.id },
          data,
        })
      }
      return tx.siteSettings.create({ data })
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to persist site settings in footer POST API:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse('Invalid site settings payload', { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const payload = await request.json()
  const { id: _ignoredId, ...rawData } = payload
  const data = normalizeSiteSettingsPayload(rawData)
  try {
    const settings = await prisma.$transaction(async (tx) => {
      const existing = await tx.siteSettings.findFirst()
      if (existing) {
        return tx.siteSettings.update({
          where: { id: existing.id },
          data,
        })
      }
      return tx.siteSettings.create({ data })
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to persist site settings in footer PUT API:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse('Invalid site settings payload', { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE() {
  const session = await getAdminSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  try {
    await prisma.siteSettings.deleteMany()
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Failed to delete site settings in footer DELETE API:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
