"use client"

import * as React from "react"
import { useTransition } from "react"
import { toast } from "sonner"

import { DataTable } from "@/components/admin/ui/data-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { createPost, updatePost, deletePost, bulkDeletePosts, duplicatePost } from "../actions"
import { postFormSchema, type PostFormValues } from "../schema"
import type { SerializedPost } from "../serializers"
import { PostFormDrawer, type PostFormDrawerMode } from "./post-form-drawer"
import { createPostColumns, type PostRow } from "./post-columns"

const EMPTY_FORM: PostFormValues = {
  title: "",
  slug: "",
  content: "",
  metaDescription: "",
  featuredBanner: "",
  published: true,
}

type DrawerState = {
  mode: PostFormDrawerMode
  post?: PostRow
}

type BulkDeleteState = {
  rows: PostRow[]
  clearSelection: () => void
}

type PostsPageShellProps = {
  initialPosts: SerializedPost[]
}

export function PostsPageShell({ initialPosts }: PostsPageShellProps) {
  const [posts, setPosts] = React.useState<PostRow[]>(initialPosts)
  const postsRef = React.useRef(posts)
  React.useEffect(() => {
    postsRef.current = posts
  }, [posts])

  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<PostRow | null>(null)
  const [bulkDeleteState, setBulkDeleteState] = React.useState<BulkDeleteState | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const ensureSlug = React.useCallback((slug: string) => {
    const existingSlugs = new Set(postsRef.current.map((post) => post.slug))
    let candidate = slug
    let counter = 1
    while (existingSlugs.has(candidate)) {
      candidate = `${slug}-${counter}`
      counter += 1
    }
    return candidate
  }, [])

  const openCreateDrawer = React.useCallback(() => {
    setDrawerState({ mode: "create" })
  }, [])

  const openEditDrawer = React.useCallback((post: PostRow) => {
    setDrawerState({ mode: "edit", post })
  }, [])

  const openDuplicateDrawer = React.useCallback((post: PostRow) => {
    const suggestedSlug = ensureSlug(`${post.slug}-copy`)
    setDrawerState({
      mode: "duplicate",
      post: { ...post, slug: suggestedSlug, published: false },
    })
  }, [ensureSlug])

  const closeDrawer = React.useCallback(() => setDrawerState(null), [])

  const handleCreate = React.useCallback(
    (values: PostFormValues) => {
      const parsed = postFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const placeholder: PostRow = {
        id: -Math.floor(Math.random() * 1_000_000),
        slug: parsed.data.slug,
        title: parsed.data.title,
        content: parsed.data.content ?? null,
        metaDescription: parsed.data.metaDescription ?? null,
        featuredBanner: parsed.data.featuredBanner && parsed.data.featuredBanner.length > 0
          ? parsed.data.featuredBanner
          : null,
        published: parsed.data.published ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const snapshot = postsRef.current
      const optimistic = [placeholder, ...snapshot]
      setPosts(optimistic)
      postsRef.current = optimistic

      startTransition(async () => {
        const result = await createPost(parsed.data)
        if (!result.ok) {
          setPosts(snapshot)
          postsRef.current = snapshot
          toast.error(result.message)
          return
        }

        setPosts((current) => {
          const withoutPlaceholder = current.filter((post) => post.slug !== placeholder.slug)
          const next = [result.data, ...withoutPlaceholder]
          postsRef.current = next
          return next
        })
        toast.success("Post created")
        closeDrawer()
      })
    },
    [closeDrawer, startTransition],
  )

  const handleUpdate = React.useCallback(
    (values: PostFormValues) => {
      if (!drawerState?.post) return
      const parsed = postFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const snapshot = postsRef.current
      const optimistic = snapshot.map((post) =>
        post.id === drawerState.post?.id
          ? {
              ...post,
              ...parsed.data,
              content: parsed.data.content ?? null,
              metaDescription: parsed.data.metaDescription ?? null,
              featuredBanner:
                parsed.data.featuredBanner && parsed.data.featuredBanner.length > 0
                  ? parsed.data.featuredBanner
                  : null,
              updatedAt: new Date().toISOString(),
            }
          : post,
      )
      setPosts(optimistic)
      postsRef.current = optimistic

      startTransition(async () => {
        const result = await updatePost(drawerState.post!.slug, parsed.data)
        if (!result.ok) {
          setPosts(snapshot)
          postsRef.current = snapshot
          toast.error(result.message)
          return
        }

        setPosts((current) => {
          const next = current.map((post) => (post.id === result.data.id ? result.data : post))
          postsRef.current = next
          return next
        })
        toast.success("Post updated")
        closeDrawer()
      })
    },
    [drawerState?.post, closeDrawer, startTransition],
  )

  const handleDuplicateFromDrawer = React.useCallback(
    (values: PostFormValues) => {
      handleCreate(values)
    },
    [handleCreate],
  )

  const handleDelete = React.useCallback(
    (post: PostRow) => {
      setDeleteTarget(post)
    },
    [],
  )

  const confirmDelete = React.useCallback(() => {
    if (!deleteTarget) return
    const snapshot = postsRef.current
    const remaining = snapshot.filter((post) => post.id !== deleteTarget.id)
    setPosts(remaining)
    postsRef.current = remaining

    startTransition(async () => {
      const result = await deletePost(deleteTarget.slug)
      if (!result.ok) {
        setPosts(snapshot)
        postsRef.current = snapshot
        toast.error(result.message)
        return
      }

      toast.success("Post deleted")
      setDeleteTarget(null)
    })
  }, [deleteTarget, startTransition])

  const confirmBulkDelete = React.useCallback(() => {
    if (!bulkDeleteState) return
    const idsToDelete = new Set(bulkDeleteState.rows.map((row) => row.slug))
    const snapshot = postsRef.current
    const remaining = snapshot.filter((post) => !idsToDelete.has(post.slug))
    setPosts(remaining)
    postsRef.current = remaining

    startBulkTransition(async () => {
      const result = await bulkDeletePosts(bulkDeleteState.rows.map((row) => row.slug))
      if (!result.ok) {
        setPosts(snapshot)
        postsRef.current = snapshot
        toast.error(result.message)
        return
      }

      toast.success(
        result.data.count > 0
          ? `Deleted ${result.data.count} ${result.data.count === 1 ? "post" : "posts"}`
          : "No posts deleted",
      )
      bulkDeleteState.clearSelection()
      setBulkDeleteState(null)
    })
  }, [bulkDeleteState, startBulkTransition])

  const handleQuickDuplicate = React.useCallback(
    (post: PostRow) => {
      startQuickTransition(async () => {
        const result = await duplicatePost(post.slug)
        if (!result.ok) {
          toast.error(result.message)
          return
        }

        setPosts((current) => {
          const next = [result.data, ...current]
          postsRef.current = next
          return next
        })
        toast.success("Post duplicated")
      })
    },
    [startQuickTransition],
  )

  const columns = React.useMemo(
    () =>
      createPostColumns({
        onEdit: openEditDrawer,
        onDuplicate: openDuplicateDrawer,
        onQuickDuplicate: handleQuickDuplicate,
        onDelete: handleDelete,
      }),
    [handleDelete, handleQuickDuplicate, openDuplicateDrawer, openEditDrawer],
  )

  const drawerDefaultValues = React.useMemo((): PostFormValues => {
    if (!drawerState) return EMPTY_FORM
    if (drawerState.mode === "create") {
      return EMPTY_FORM
    }
    const post = drawerState.post!
    return {
      title: post.title ?? "",
      slug: post.slug ?? "",
      content: post.content ?? "",
      metaDescription: post.metaDescription ?? "",
      featuredBanner: post.featuredBanner ?? "",
      published: post.published,
    }
  }, [drawerState])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your published content and drafts from a single place.
            </p>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={posts}
          searchKey="title"
          searchPlaceholder="Search posts..."
          emptyState={{
            title: "No posts yet",
            description: "Create your first post to start sharing updates.",
            action: (
              <Button onClick={openCreateDrawer} size="sm">
                Create your first post
              </Button>
            ),
          }}
          primaryAction={
            <Button size="sm" onClick={openCreateDrawer}>
              New post
            </Button>
          }
          bulkActions={({ rows, clearSelection }) => (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteState({ rows, clearSelection })}
              disabled={isBulkPending}
              className="h-8"
            >
              Delete selected ({rows.length})
            </Button>
          )}
          isLoading={isPending || isBulkPending}
          getRowId={(row) => row.slug}
        />
      </div>

      <PostFormDrawer
        mode={drawerState?.mode ?? "create"}
        open={drawerState !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDrawer()
          }
        }}
        defaultValues={drawerDefaultValues}
        onSubmit={(values) => {
          if (drawerState?.mode === "edit") {
            return handleUpdate(values)
          }
          if (drawerState?.mode === "duplicate") {
            return handleDuplicateFromDrawer(values)
          }
          return handleCreate(values)
        }}
        isPending={isPending}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteState !== null} onOpenChange={(open) => !open && setBulkDeleteState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {bulkDeleteState?.rows.length ?? 0} posts?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected posts and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isBulkPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
