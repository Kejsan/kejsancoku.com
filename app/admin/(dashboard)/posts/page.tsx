import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { getSafeAdminSession } from "@/lib/safe-session"
import { serializePost } from "./serializers"
import { PostsPageShell } from "./_components/posts-shell"

export const dynamic = "force-dynamic"

export default async function PostsPage() {
  const sessionResult = await getSafeAdminSession()

  if (!sessionResult.ok || !sessionResult.session) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            You must be signed in as an admin to manage posts.
          </p>
        </div>
      </div>
    )
  }

  if (!prisma) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Database connection is not configured. Verify DATABASE_URL and run `pnpm prisma migrate deploy` to manage posts.
          </p>
        </div>
      </div>
    )
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
    })

    return <PostsPageShell initialPosts={posts.map(serializePost)} />
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      console.warn("[PostsPage] Prisma client issue", {
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        message: error.message,
      })

      return (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="text-sm text-muted-foreground">
              Unable to load posts. Verify your DATABASE_URL and run `pnpm prisma migrate deploy`.
            </p>
          </div>
        </div>
      )
    }

    console.error("[PostsPage] Unexpected error while loading posts", error)

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading posts. Check the server logs and try again.
          </p>
        </div>
      </div>
    )
  }
}
