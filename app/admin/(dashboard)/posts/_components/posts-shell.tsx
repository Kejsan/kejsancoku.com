"use client"

import * as React from "react"
import { useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Filter, Upload } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  bulkCreatePosts,
  bulkDeletePosts,
  bulkPublishPosts,
  bulkUnpublishPosts,
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
import { createPostColumns, type PostRow } from "./post-columns"

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

type BulkDeleteState = {
  rows: PostRow[]
  clearSelection: () => void
}

type StatusFilterValue = "all" | "draft" | "scheduled" | "published"

const STATUS_FILTER_LABELS: Record<StatusFilterValue, string> = {
  all: "All statuses",
  draft: "Drafts",
  scheduled: "Scheduled",
  published: "Published",
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

  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<PostRow | null>(null)
  const [bulkDeleteState, setBulkDeleteState] = React.useState<BulkDeleteState | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterValue>("all")
  const [csvUploadOpen, setCsvUploadOpen] = React.useState(false)

  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()
  const [isStatusPending, startStatusTransition] = useTransition()
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

  // Listen for create events from topbar
  React.useEffect(() => {
    const handleCreateEvent = (event: CustomEvent) => {
      if (event.detail?.section === "/admin/posts") {
        openCreateDrawer()
        // Clean up URL param
        router.replace("/admin/posts")
      }
    }
    window.addEventListener("admin:create" as any, handleCreateEvent as EventListener)
    return () => {
      window.removeEventListener("admin:create" as any, handleCreateEvent as EventListener)
    }
  }, [openCreateDrawer, router])

  // Check URL params for create trigger
  React.useEffect(() => {
    if (searchParams.get("create") === "true") {
      openCreateDrawer()
      // Clean up URL param
      router.replace("/admin/posts")
    }
  }, [searchParams, openCreateDrawer, router])

  const openEditDrawer = React.useCallback((post: PostRow) => {
    setDrawerState({ mode: "edit", post })
  }, [])

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
          const result = await updatePost(drawerState.post!.slug, parsed.data)
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

  const handleBulkStatusChange = React.useCallback(
    (rows: PostRow[], clearSelection: () => void, target: "publish" | "draft") => {
      const slugs = rows.map((row) => row.slug)
      if (slugs.length === 0) return

      startStatusTransition(() => {
        void (async () => {
          const result =
            target === "publish"
              ? await bulkPublishPosts(slugs)
              : await bulkUnpublishPosts(slugs)

          if (!result.ok) {
            toast.error(result.message)
            return
          }

          applyServerUpdates(result.data.posts)
          clearSelection()

          if (result.data.count === 0) {
            toast.info("No posts updated")
          } else {
            toast.success(
              target === "publish"
                ? `Published ${result.data.count} ${result.data.count === 1 ? "post" : "posts"}`
                : `Unpublished ${result.data.count} ${result.data.count === 1 ? "post" : "posts"}`,
            )
          }
        })()
      })
    },
    [applyServerUpdates, startStatusTransition],
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
        const result = await deletePost(deleteTarget.slug)
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

  const confirmBulkDelete = React.useCallback(() => {
    if (!bulkDeleteState) return
    const idsToDelete = new Set(bulkDeleteState.rows.map((row) => row.slug))
    const snapshot = postsRef.current
    const remaining = snapshot.filter((post) => !idsToDelete.has(post.slug))
    setPosts(remaining)
    postsRef.current = remaining

    startBulkTransition(() => {
      void (async () => {
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
      })()
    })
  }, [bulkDeleteState, startBulkTransition])

  const handleQuickDuplicate = React.useCallback(
    (post: PostRow) => {
      startQuickTransition(() => {
        void (async () => {
          const result = await duplicatePost(post.slug)
          if (!result.ok) {
            toast.error(result.message)
            return
          }

          setPosts((current) => {
            const next = [result.data, ...current].sort(
              (a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf(),
            )
            postsRef.current = next
            return next
          })
          toast.success("Post duplicated")
        })()
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
      status: post.status ?? "draft",
      scheduledAt: post.scheduledAt ?? undefined,
      publishedAt: post.publishedAt ?? undefined,
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
          searchPlaceholder="Search title or slug..."
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
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={openCreateDrawer}>
                New post
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCsvUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk upload
              </Button>
            </div>
          }
          toolbarActions={(table) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Filter className="h-4 w-4" aria-hidden />
                  {STATUS_FILTER_LABELS[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Filter status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(value) => {
                    const nextValue = value as StatusFilterValue
                    setStatusFilter(nextValue)
                    const column = table.getColumn("status")
                    column?.setFilterValue(nextValue === "all" ? undefined : nextValue)
                  }}
                >
                  <DropdownMenuRadioItem value="all">All statuses</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="scheduled">Scheduled</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="draft">Drafts</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          bulkActions={({ rows, clearSelection }) => (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkStatusChange(rows, clearSelection, "publish")}
                disabled={isStatusPending}
                className="h-8"
              >
                Publish ({rows.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange(rows, clearSelection, "draft")}
                disabled={isStatusPending}
                className="h-8"
              >
                Unpublish
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteState({ rows, clearSelection })}
                disabled={isBulkPending}
                className="h-8"
              >
                Delete ({rows.length})
              </Button>
            </div>
          )}
          isLoading={isPending || isBulkPending || isStatusPending}
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

      <CSVUploadDialog
        open={csvUploadOpen}
        onOpenChange={setCsvUploadOpen}
        onUpload={async (rows) => {
          const normalizedRows: PostFormValues[] = rows.map((row) => ({
            title: row.title,
            slug: row.slug,
            content: row.content,
            metaDescription: row.metaDescription,
            featuredBanner: row.featuredBanner,
            status: (row.status ?? "draft") as PostFormValues["status"],
            scheduledAt: row.scheduledAt,
            publishedAt: row.publishedAt,
          }))

          const result = await bulkCreatePosts(normalizedRows)
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
