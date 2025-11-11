import { prisma } from "@/lib/prisma"
import { serializePost } from "./serializers"
import { PostsPageShell } from "./_components/posts-shell"

export const dynamic = "force-dynamic"

export default async function PostsPage() {
  if (!prisma) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Database connection is not configured. Configure DATABASE_URL to manage posts.
          </p>
        </div>
      </div>
    )
  }

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return <PostsPageShell initialPosts={posts.map(serializePost)} />
}
