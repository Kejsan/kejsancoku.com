"use client"

import * as React from "react"
import { useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Filter, Upload } from "lucide-react"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
import { AdminCard } from "@/components/admin/admin-card"
import {
  bulkCreatePosts,
  createPost,
  deletePost,
  duplicatePost,
  updatePost,
} from "../actions"
import { CSVUploadDialog } from "./csv-upload-dialog"
import { clientDateTimeToIso } from "../date-utils"
import { postFormSchema, type PostFormValues } from "../schema"
import type { SerializedPost } from "../serializers"
import { PostFormDrawer, type PostFormDrawerMode } from "./post-form-drawer"

export type PostRow = SerializedPost

const EMPTY_FORM: PostFormValues = {
  title: "",
  slug: "",
  content: "",
  metaDescription: "",
  featuredBanner: "",
  status: "draft",
  scheduledAt: undefined,
  publishedAt: undefined,
}

type DrawerState = {
  mode: PostFormDrawerMode
  post?: PostRow
}

function toNullableString(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

function toIsoStringOrNull(value?: string | null) {
  return clientDateTimeToIso(value)
}

function computeStatusFields(existing: PostRow | null, values: PostFormValues, nowIso: string) {
  const scheduledAt = values.status === "scheduled" ? toIsoStringOrNull(values.scheduledAt) : null
  const publishedAt = values.status === "published"
    ? toIsoStringOrNull(values.publishedAt) ?? (existing?.publishedAt ?? nowIso)
    : null

  const statusChanged =
    !existing ||
    existing.status !== values.status ||
    (existing.scheduledAt ?? null) !== (scheduledAt ?? null) ||
    (existing.publishedAt ?? null) !== (publishedAt ?? null)

  return {
    status: values.status,
    scheduledAt,
    publishedAt,
    published: values.status === "published",
    statusChangedAt: statusChanged ? nowIso : existing?.statusChangedAt ?? nowIso,
  }
}

function createOptimisticPost(values: PostFormValues): PostRow {
  const now = new Date().toISOString()
  const statusFields = computeStatusFields(null, values, now)
  return {
    id: -Math.floor(Math.random() * 1_000_000),
    slug: values.slug.trim(),
    title: values.title.trim(),
    content: toNullableString(values.content),
    metaDescription: toNullableString(values.metaDescription),
    featuredBanner: toNullableString(values.featuredBanner),
    createdAt: now,
    updatedAt: now,
    statusChangedBy: null,
    ...statusFields,
  }
}

function updateOptimisticPost(existing: PostRow, values: PostFormValues): PostRow {
  const now = new Date().toISOString()
  const statusFields = computeStatusFields(existing, values, now)
  return {
    ...existing,
    slug: values.slug.trim(),
    title: values.title.trim(),
    content: toNullableString(values.content),
    metaDescription: toNullableString(values.metaDescription),
    featuredBanner: toNullableString(values.featuredBanner),
    updatedAt: now,
    ...statusFields,
  }
}

type PostsPageShellProps = {
  initialPosts: SerializedPost[]
}

export function PostsPageShell({ initialPosts }: PostsPageShellProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [posts, setPosts] = React.useState<PostRow[]>(() =>
    [...initialPosts].sort((a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()),
  )
  const postsRef = React.useRef(posts)
  React.useEffect(() => {
    postsRef.current = posts
  }, [posts])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<PostRow | null>(null)
  const [csvUploadOpen, setCsvUploadOpen] = React.useState(false)

  const [isPending, startTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const filteredPosts = React.useMemo(() => {
    if (!searchQuery) return posts
    const lower = searchQuery.toLowerCase()
    return posts.filter((post) =>
      post.title.toLowerCase().includes(lower) ||
      post.slug.toLowerCase().includes(lower)
    )
  }, [posts, searchQuery])

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

  // Check URL params for create trigger
  React.useEffect(() => {
    if (searchParams.get("create") === "true") {
      openCreateDrawer()
      // Clean up URL param
      router.replace("/admin/posts")
    }
  }, [searchParams, openCreateDrawer, router])

  const navigateToEdit = React.useCallback((post: PostRow) => {
    router.push(`/admin/posts/${post.id}/edit`)
  }, [router])

  const openDuplicateDrawer = React.useCallback((post: PostRow) => {
    const suggestedSlug = ensureSlug(`${post.slug}-copy`)
    setDrawerState({
      mode: "duplicate",
      post: {
        ...post,
        slug: suggestedSlug,
        status: "draft",
        published: false,
        scheduledAt: null,
        publishedAt: null,
      },
    })
  }, [ensureSlug])

  const closeDrawer = React.useCallback(() => setDrawerState(null), [])

  const applyServerUpdates = React.useCallback((updated: SerializedPost[]) => {
    setPosts((current) => {
      const map = new Map(updated.map((post) => [post.id, post]))
      const next = current
        .map((row) => map.get(row.id) ?? row)
        .sort((a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf())
      postsRef.current = next
      return next
    })
  }, [])

  const handleCreate = React.useCallback(
    (values: PostFormValues) => {
      const parsed = postFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const placeholder = createOptimisticPost(parsed.data)

      const snapshot = postsRef.current
      const optimistic = [placeholder, ...snapshot]
      setPosts(optimistic)
      postsRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await createPost(parsed.data)
          if (!result.ok) {
            setPosts(snapshot)
            postsRef.current = snapshot
            toast.error(result.message)
            return
          }

          setPosts((current) => {
            const withoutPlaceholder = current.filter((post) => post.id !== placeholder.id)
            const next = [result.data, ...withoutPlaceholder].sort(
              (a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf(),
            )
            postsRef.current = next
            return next
          })
          toast.success("Post created")
          closeDrawer()
        })()
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
        post.id === drawerState.post?.id ? updateOptimisticPost(post, parsed.data) : post,
      )
      setPosts(optimistic)
      postsRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await updatePost(drawerState.post!.id, parsed.data)
          if (!result.ok) {
            setPosts(snapshot)
            postsRef.current = snapshot
            toast.error(result.message)
            return
          }

          applyServerUpdates([result.data])
          toast.success("Post updated")
          closeDrawer()
        })()
      })
    },
    [applyServerUpdates, drawerState?.post, closeDrawer, startTransition],
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

    startTransition(() => {
      void (async () => {
        const result = await deletePost(deleteTarget.id)
        if (!result.ok) {
          setPosts(snapshot)
          postsRef.current = snapshot
          toast.error(result.message)
          return
        }

        toast.success("Post deleted")
        setDeleteTarget(null)
      })()
    })
  }, [deleteTarget, startTransition])


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
      status: post.status ?? "draft",
      scheduledAt: post.scheduledAt ?? undefined,
      publishedAt: post.publishedAt ?? undefined,
    }
  }, [drawerState])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your published content and drafts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openCreateDrawer}>
              New post
            </Button>
            <Button size="icon" variant="outline" onClick={() => setCsvUploadOpen(true)} title="Bulk Upload">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-16 text-center text-muted-foreground">
            <p className="text-base font-medium">No posts found</p>
            <p className="max-w-lg text-sm text-muted-foreground/80">
              {searchQuery ? "Try a different search term." : "Create your first post to start sharing updates."}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={openCreateDrawer}>
                Create your first post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPosts.map((post) => {
              const status = post.status
              const isPublished = status === 'published'
              const date = new Date(post.updatedAt)
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

              return (
                <AdminCard
                  key={post.id}
                  title={post.title}
                  description={post.metaDescription || post.slug}
                  status={isPublished ? "published" : "hidden"}
                  actions={
                    <>
                      <Button variant="ghost" size="sm" onClick={() => navigateToEdit(post)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(post)}
                      >
                        Delete
                      </Button>
                    </>
                  }
                  footer={
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{status}</span>
                      <span>Updated {dateStr}</span>
                    </div>
                  }
                />
              )
            })}
          </div>
        )}
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

      <CSVUploadDialog
        open={csvUploadOpen}
        onOpenChange={setCsvUploadOpen}
        onUpload={async (rows) => {
          const result = await bulkCreatePosts(rows)
          if (!result.ok) {
            toast.error(result.message)
            return
          }
          toast.success(`Successfully created ${result.data.count} post${result.data.count !== 1 ? "s" : ""}`)
          // Refresh posts list
          applyServerUpdates(result.data.created)
        }}
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
    </>
  )
}
