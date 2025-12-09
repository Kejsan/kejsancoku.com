"use client"

import * as React from "react"
import { useTransition } from "react"
import { toast } from "sonner"
import { LinkIcon, Link } from "lucide-react"

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
  createWorkSample,
  deleteWorkSample,
  duplicateWorkSample,
  toggleWorkSamplePublished,
  updateWorkSample,
} from "../actions"
import { workSampleFormSchema, type WorkSampleFormValues } from "../schema"
import type { SerializedWorkSample } from "../serializers"
import { WorkSampleFormDrawer, type WorkSampleFormDrawerMode } from "./work-sample-form-drawer"
import { WorkSamplePreviewDrawer } from "./work-sample-preview-drawer"

export type WorkSampleRow = SerializedWorkSample

const EMPTY_FORM: WorkSampleFormValues = {
  title: "",
  url: "",
  description: "",
}

type DrawerState = {
  mode: WorkSampleFormDrawerMode
  sample?: WorkSampleRow
}

type WorkSamplesShellProps = {
  initialWorkSamples: SerializedWorkSample[]
}

export function WorkSamplesShell({ initialWorkSamples }: WorkSamplesShellProps) {
  const [samples, setSamples] = React.useState<WorkSampleRow[]>(initialWorkSamples)
  const samplesRef = React.useRef(samples)
  React.useEffect(() => {
    samplesRef.current = samples
  }, [samples])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<WorkSampleRow | null>(null)
  const [previewSample, setPreviewSample] = React.useState<WorkSampleRow | null>(null)

  const [isPending, startTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const filteredSamples = React.useMemo(() => {
    if (!searchQuery) return samples
    const lower = searchQuery.toLowerCase()
    return samples.filter((sample) =>
      sample.title.toLowerCase().includes(lower) ||
      (sample.description && sample.description.toLowerCase().includes(lower))
    )
  }, [samples, searchQuery])

  const openCreateDrawer = React.useCallback(() => setDrawerState({ mode: "create" }), [])

  // Check URL params for create trigger
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("create") === "true") {
      openCreateDrawer()
      // Remove query param without full reload
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [openCreateDrawer])

  const openEditDrawer = React.useCallback((sample: WorkSampleRow) => setDrawerState({ mode: "edit", sample }), [])

  const openDuplicateDrawer = React.useCallback((sample: WorkSampleRow) => {
    setDrawerState({
      mode: "duplicate",
      sample: {
        ...sample,
        title: `${sample.title} (Copy)`
          .trim()
          .slice(0, 160),
      },
    })
  }, [])

  const closeDrawer = React.useCallback(() => setDrawerState(null), [])

  const handleCreate = React.useCallback(
    (values: WorkSampleFormValues) => {
      const parsed = workSampleFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const placeholder: WorkSampleRow = {
        id: -Math.floor(Math.random() * 1_000_000),
        title: parsed.data.title,
        url: parsed.data.url && parsed.data.url.length > 0 ? parsed.data.url : null,
        description: parsed.data.description?.length ? parsed.data.description : null,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const snapshot = samplesRef.current
      const optimistic = [placeholder, ...snapshot]
      setSamples(optimistic)
      samplesRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await createWorkSample(parsed.data)
          if (!result.ok) {
            setSamples(snapshot)
            samplesRef.current = snapshot
            toast.error(result.message)
            return
          }

          setSamples((current) => {
            const withoutPlaceholder = current.filter((sample) => sample.id !== placeholder.id)
            const next = [result.data, ...withoutPlaceholder]
            samplesRef.current = next
            return next
          })
          toast.success("Work sample created")
          closeDrawer()
        })()
      })
    },
    [closeDrawer, startTransition],
  )

  const handleUpdate = React.useCallback(
    (values: WorkSampleFormValues) => {
      if (!drawerState?.sample) return
      const parsed = workSampleFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const snapshot = samplesRef.current
      const optimistic = snapshot.map((sample) =>
        sample.id === drawerState.sample?.id
          ? {
            ...sample,
            title: parsed.data.title,
            url: parsed.data.url && parsed.data.url.length > 0 ? parsed.data.url : null,
            description: parsed.data.description?.length ? parsed.data.description : null,
            updatedAt: new Date().toISOString(),
          }
          : sample,
      )
      setSamples(optimistic)
      samplesRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await updateWorkSample(drawerState.sample!.id, parsed.data)
          if (!result.ok) {
            setSamples(snapshot)
            samplesRef.current = snapshot
            toast.error(result.message)
            return
          }

          setSamples((current) => {
            const next = current.map((sample) => (sample.id === result.data.id ? result.data : sample))
            samplesRef.current = next
            return next
          })
          toast.success("Work sample updated")
          closeDrawer()
        })()
      })
    },
    [drawerState?.sample, closeDrawer, startTransition],
  )

  const handleDuplicateFromDrawer = React.useCallback(
    (values: WorkSampleFormValues) => {
      handleCreate(values)
    },
    [handleCreate],
  )

  const handleDelete = React.useCallback((sample: WorkSampleRow) => setDeleteTarget(sample), [])

  const confirmDelete = React.useCallback(() => {
    if (!deleteTarget) return
    const snapshot = samplesRef.current
    const remaining = snapshot.filter((sample) => sample.id !== deleteTarget.id)
    setSamples(remaining)
    samplesRef.current = remaining

    startTransition(() => {
      void (async () => {
        const result = await deleteWorkSample(deleteTarget.id)
        if (!result.ok) {
          setSamples(snapshot)
          samplesRef.current = snapshot
          toast.error(result.message)
          return
        }
        toast.success("Work sample deleted")
        setDeleteTarget(null)
      })()
    })
  }, [deleteTarget, startTransition])

  const handleTogglePublished = React.useCallback(
    (sample: WorkSampleRow) => {
      const snapshot = samplesRef.current
      const optimistic = snapshot.map((s) =>
        s.id === sample.id
          ? { ...s, published: !s.published }
          : s,
      )
      setSamples(optimistic)
      samplesRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await toggleWorkSamplePublished(sample.id)
          if (!result.ok) {
            setSamples(snapshot)
            samplesRef.current = snapshot
            toast.error(result.message)
            return
          }

          setSamples((current) => {
            const next = current.map((s) => (s.id === result.data.id ? result.data : s))
            samplesRef.current = next
            return next
          })
          toast.success(result.data.published ? "Work sample is now visible" : "Work sample is now hidden")
        })()
      })
    },
    [startTransition],
  )

  const drawerDefaultValues = React.useMemo((): WorkSampleFormValues => {
    if (!drawerState) return EMPTY_FORM
    if (drawerState.mode === "create") return EMPTY_FORM
    const sample = drawerState.sample!
    return {
      title: sample.title ?? "",
      url: sample.url ?? "",
      description: sample.description ?? "",
    }
  }, [drawerState])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Work samples</h1>
            <p className="text-sm text-muted-foreground">
              Share relevant projects and resources that demonstrate your expertise.
            </p>
          </div>
          <Button onClick={openCreateDrawer}>
            New work sample
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filteredSamples.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-16 text-center text-muted-foreground">
            <p className="text-base font-medium">No work samples found</p>
            <p className="max-w-lg text-sm text-muted-foreground/80">
              {searchQuery ? "Try a different search term." : "Create your first work sample to build trust."}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={openCreateDrawer}>
                Create your first work sample
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSamples.map((sample) => (
              <AdminCard
                key={sample.id}
                title={sample.title}
                description={sample.description ?? ""}
                status={sample.published ? "published" : "hidden"}
                actions={
                  <>
                    <Button variant="ghost" size="sm" onClick={() => handleTogglePublished(sample)}>
                      {sample.published ? "Hide" : "Show"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDrawer(sample)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(sample)}
                    >
                      Delete
                    </Button>
                  </>
                }
                footer={
                  sample.url ? (
                    <a
                      href={sample.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {new URL(sample.url).hostname}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No URL</span>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      <WorkSampleFormDrawer
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
            <AlertDialogTitle>Delete work sample</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The sample &ldquo;{deleteTarget?.title}&rdquo; will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WorkSamplePreviewDrawer
        sample={previewSample}
        open={previewSample !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewSample(null)
          }
        }}
      />
    </>
  )
}
