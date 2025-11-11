import { NextResponse } from 'next/server'
import type { PostStatus, Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { getSafeAdminSession } from '@/lib/safe-session'
import { serializePost } from '@/app/admin/posts/serializers'

const VALID_STATUSES = new Set(["draft", "scheduled", "published"])

export async function GET(request: Request) {
  const sessionResult = await getSafeAdminSession()
  if (!sessionResult.ok || !sessionResult.session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get('status')?.toLowerCase()
  const searchQuery = searchParams.get('q')?.trim()

  const where: Prisma.PostWhereInput = {}

  if (statusParam && VALID_STATUSES.has(statusParam)) {
    where.status = statusParam.toUpperCase() as PostStatus
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { slug: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ posts: posts.map(serializePost) })
}
