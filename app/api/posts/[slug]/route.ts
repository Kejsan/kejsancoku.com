import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildAuditDiff, recordAudit } from '@/lib/audit'

type Params = { params: { slug: string } }

export async function GET(_req: Request, { params }: Params) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  return NextResponse.json(post)
}

export async function PUT(request: Request, { params }: Params) {
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
  const existing = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const post = await prisma.post.update({ where: { slug: params.slug }, data })
    await recordAudit({
      actorEmail: session.user?.email,
      entityType: 'Post',
      entityId: post.slug,
      action: 'UPDATE',
      diff: buildAuditDiff(existing, post),
    })
    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to update post', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
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
  const existing = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    await prisma.post.delete({ where: { slug: params.slug } })
    await recordAudit({
      actorEmail: session.user?.email,
      entityType: 'Post',
      entityId: existing.slug,
      action: 'DELETE',
      diff: buildAuditDiff(existing, null),
    })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Failed to delete post', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
