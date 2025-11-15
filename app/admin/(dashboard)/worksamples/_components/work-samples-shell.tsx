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
import {
  bulkDeleteWorkSamples,
  createWorkSample,
  deleteWorkSample,
  duplicateWorkSample,
  updateWorkSample,
} from "../actions"
import { workSampleFormSchema, type WorkSampleFormValues } from "../schema"
import type { SerializedWorkSample } from "../serializers"
import { WorkSampleFormDrawer, type WorkSampleFormDrawerMode } from "./work-sample-form-drawer"
import { WorkSamplePreviewDrawer } from "./work-sample-preview-drawer"
import { createWorkSampleColumns, type WorkSampleRow } from "./work-sample-columns"

const EMPTY_FORM: WorkSampleFormValues = {
  title: "",
  url: "",
  description: "",
}

type DrawerState = {
  mode: WorkSampleFormDrawerMode
  sample?: WorkSampleRow
}

type BulkDeleteState = {
  rows: WorkSampleRow[]
  clearSelection: () => void
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

  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<WorkSampleRow | null>(null)
  const [bulkDeleteState, setBulkDeleteState] = React.useState<BulkDeleteState | null>(null)
  const [previewSample, setPreviewSample] = React.useState<WorkSampleRow | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const openCreateDrawer = React.useCallback(() => setDrawerState({ mode: "create" }), [])
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

  const confirmBulkDelete = React.useCallback(() => {
    if (!bulkDeleteState) return
    const ids = bulkDeleteState.rows.map((row) => row.id)
    const snapshot = samplesRef.current
    const remaining = snapshot.filter((sample) => !ids.includes(sample.id))
    setSamples(remaining)
    samplesRef.current = remaining

    startBulkTransition(() => {
      void (async () => {
        const result = await bulkDeleteWorkSamples(ids)
        if (!result.ok) {
          setSamples(snapshot)
          samplesRef.current = snapshot
          toast.error(result.message)
          return
        }

        toast.success(
          result.data.count > 0
            ? `Deleted ${result.data.count} ${result.data.count === 1 ? "sample" : "samples"}`
            : "No samples deleted",
        )
        bulkDeleteState.clearSelection()
        setBulkDeleteState(null)
      })()
    })
  }, [bulkDeleteState, startBulkTransition])

  const handleQuickDuplicate = React.useCallback(
    (sample: WorkSampleRow) => {
      startQuickTransition(() => {
        void (async () => {
          const result = await duplicateWorkSample(sample.id)
          if (!result.ok) {
            toast.error(result.message)
            return
          }

          setSamples((current) => {
            const next = [result.data, ...current]
            samplesRef.current = next
            return next
          })
          toast.success("Work sample duplicated")
        })()
      })
    },
    [startQuickTransition],
  )

  const handleView = React.useCallback((sample: WorkSampleRow) => {
    setPreviewSample(sample)
  }, [])

  const columns = React.useMemo(
    () =>
      createWorkSampleColumns({
        onView: handleView,
        onEdit: openEditDrawer,
        onDuplicate: openDuplicateDrawer,
        onQuickDuplicate: handleQuickDuplicate,
        onDelete: handleDelete,
      }),
    [handleDelete, handleQuickDuplicate, handleView, openDuplicateDrawer, openEditDrawer],
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work samples</h1>
          <p className="text-sm text-muted-foreground">
            Share relevant projects and resources that demonstrate your expertise.
          </p>
        </div>
        <DataTable
          columns={columns}
          data={samples}
          searchKey="title"
          searchPlaceholder="Search samples..."
          emptyState={{
            title: "No work samples yet",
            description: "Add case studies or projects to build trust.",
            action: (
              <Button onClick={openCreateDrawer} size="sm">
                Create your first work sample
              </Button>
            ),
          }}
          primaryAction={
            <Button size="sm" onClick={openCreateDrawer}>
              New work sample
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
          getRowId={(row) => String(row.id)}
        />
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

      <AlertDialog open={bulkDeleteState !== null} onOpenChange={(open) => !open && setBulkDeleteState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {bulkDeleteState?.rows.length ?? 0} work samples?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected samples and cannot be undone.
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
