import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: { slug: string } }

export async function GET(_req: Request, { params }: Params) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }
  const now = new Date()
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
      published: true,
      publishedAt: { not: null, lte: now },
    },
  })
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(post)
}
