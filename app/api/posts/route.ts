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
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const data = await request.json()
  try {
    const post = await prisma.post.create({ data })
    await recordAudit({
      actorEmail: session.user?.email,
      entityType: 'Post',
      entityId: post.slug,
      action: 'CREATE',
      diff: buildAuditDiff(null, post),
    })
    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to create post', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
