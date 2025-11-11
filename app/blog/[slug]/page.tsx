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
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
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
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
  })

  return <BlogPostClient post={post} />
}
