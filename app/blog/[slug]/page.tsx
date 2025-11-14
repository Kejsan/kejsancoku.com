import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import BlogPostClient from "./blog-post-client"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (!prisma) {
    console.warn('Prisma client unavailable while generating blog post metadata.')
    return {
      title: "Post Not Available",
      description: "Database connection is not configured.",
    }
  }
  const now = new Date()
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      status: "PUBLISHED",
      published: true,
      publishedAt: { not: null, lte: now },
    },
  })

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.metaDescription,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  if (!prisma) {
    console.warn('Prisma client unavailable while rendering blog post page.')
    return <BlogPostClient post={null} />
  }
  const now = new Date()
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      status: "PUBLISHED",
      published: true,
      publishedAt: { not: null, lte: now },
    },
  })

  return <BlogPostClient post={post} />
}
