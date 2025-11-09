import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
  const post = await prisma.post.create({ data })
  return NextResponse.json(post)
}
