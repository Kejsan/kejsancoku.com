export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const now = new Date()
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      published: true,
      publishedAt: { not: null, lte: now },
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  })
  return NextResponse.json(posts)
}
