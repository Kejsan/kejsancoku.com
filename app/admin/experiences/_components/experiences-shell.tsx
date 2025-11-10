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
  bulkDeleteExperiences,
  createExperience,
  deleteExperience,
  duplicateExperience,
  updateExperience,
} from "../actions"
import { experienceFormSchema, type ExperienceFormValues } from "../schema"
import type { SerializedExperience } from "../serializers"
import { ExperienceFormDrawer, type ExperienceFormDrawerMode } from "./experience-form-drawer"
import { createExperienceColumns, type ExperienceRow } from "./experience-columns"

const EMPTY_FORM: ExperienceFormValues = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  description: "",
}

type DrawerState = {
  mode: ExperienceFormDrawerMode
  experience?: ExperienceRow
}

type BulkDeleteState = {
  rows: ExperienceRow[]
  clearSelection: () => void
}

type ExperiencesShellProps = {
  initialExperiences: SerializedExperience[]
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ""
  return date.toISOString().slice(0, 10)
}

export function ExperiencesShell({ initialExperiences }: ExperiencesShellProps) {
  const [experiences, setExperiences] = React.useState<ExperienceRow[]>(initialExperiences)
  const experiencesRef = React.useRef(experiences)
  React.useEffect(() => {
    experiencesRef.current = experiences
  }, [experiences])

  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<ExperienceRow | null>(null)
  const [bulkDeleteState, setBulkDeleteState] = React.useState<BulkDeleteState | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const openCreateDrawer = React.useCallback(() => setDrawerState({ mode: "create" }), [])
  const openEditDrawer = React.useCallback((experience: ExperienceRow) => setDrawerState({ mode: "edit", experience }), [])
  const openDuplicateDrawer = React.useCallback((experience: ExperienceRow) => {
    setDrawerState({
      mode: "duplicate",
      experience: {
        ...experience,
        company: `${experience.company} (Copy)`,
      },
    })
  }, [])
  const closeDrawer = React.useCallback(() => setDrawerState(null), [])

  const handleCreate = React.useCallback(
    (values: ExperienceFormValues) => {
      const parsed = experienceFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const placeholder: ExperienceRow = {
        id: -Math.floor(Math.random() * 1_000_000),
        company: parsed.data.company,
        role: parsed.data.role,
        startDate: new Date(parsed.data.startDate).toISOString(),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate).toISOString() : null,
        description: parsed.data.description?.length ? parsed.data.description : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const snapshot = experiencesRef.current
      const optimistic = [placeholder, ...snapshot]
      setExperiences(optimistic)
      experiencesRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await createExperience(parsed.data)
          if (!result.ok) {
            setExperiences(snapshot)
            experiencesRef.current = snapshot
            toast.error(result.message)
            return
          }

          setExperiences((current) => {
            const withoutPlaceholder = current.filter((exp) => exp.id !== placeholder.id)
            const next = [result.data, ...withoutPlaceholder]
            experiencesRef.current = next
            return next
          })
          toast.success("Experience created")
          closeDrawer()
        })()
      })
    },
    [closeDrawer, startTransition],
  )

  const handleUpdate = React.useCallback(
    (values: ExperienceFormValues) => {
      if (!drawerState?.experience) return
      const parsed = experienceFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const snapshot = experiencesRef.current
      const optimistic = snapshot.map((experience) =>
        experience.id === drawerState.experience?.id
          ? {
              ...experience,
              company: parsed.data.company,
              role: parsed.data.role,
              startDate: new Date(parsed.data.startDate).toISOString(),
              endDate: parsed.data.endDate ? new Date(parsed.data.endDate).toISOString() : null,
              description: parsed.data.description?.length ? parsed.data.description : null,
              updatedAt: new Date().toISOString(),
            }
          : experience,
      )
      setExperiences(optimistic)
      experiencesRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await updateExperience(drawerState.experience!.id, parsed.data)
          if (!result.ok) {
            setExperiences(snapshot)
            experiencesRef.current = snapshot
            toast.error(result.message)
            return
          }

          setExperiences((current) => {
            const next = current.map((experience) => (experience.id === result.data.id ? result.data : experience))
            experiencesRef.current = next
            return next
          })
          toast.success("Experience updated")
          closeDrawer()
        })()
      })
    },
    [drawerState?.experience, closeDrawer, startTransition],
  )

  const handleDuplicateFromDrawer = React.useCallback(
    (values: ExperienceFormValues) => {
      handleCreate(values)
    },
    [handleCreate],
  )

  const handleDelete = React.useCallback((experience: ExperienceRow) => setDeleteTarget(experience), [])

  const confirmDelete = React.useCallback(() => {
    if (!deleteTarget) return
    const snapshot = experiencesRef.current
    const remaining = snapshot.filter((experience) => experience.id !== deleteTarget.id)
    setExperiences(remaining)
    experiencesRef.current = remaining

    startTransition(() => {
      void (async () => {
        const result = await deleteExperience(deleteTarget.id)
        if (!result.ok) {
          setExperiences(snapshot)
          experiencesRef.current = snapshot
          toast.error(result.message)
          return
        }
        toast.success("Experience deleted")
        setDeleteTarget(null)
      })()
    })
  }, [deleteTarget, startTransition])

  const confirmBulkDelete = React.useCallback(() => {
    if (!bulkDeleteState) return
    const ids = bulkDeleteState.rows.map((row) => row.id)
    const snapshot = experiencesRef.current
    const remaining = snapshot.filter((experience) => !ids.includes(experience.id))
    setExperiences(remaining)
    experiencesRef.current = remaining

    startBulkTransition(() => {
      void (async () => {
        const result = await bulkDeleteExperiences(ids)
        if (!result.ok) {
          setExperiences(snapshot)
          experiencesRef.current = snapshot
          toast.error(result.message)
          return
        }

        toast.success(
          result.data.count > 0
            ? `Deleted ${result.data.count} ${result.data.count === 1 ? "experience" : "experiences"}`
            : "No experiences deleted",
        )
        bulkDeleteState.clearSelection()
        setBulkDeleteState(null)
      })()
    })
  }, [bulkDeleteState, startBulkTransition])

  const handleQuickDuplicate = React.useCallback(
    (experience: ExperienceRow) => {
      startQuickTransition(() => {
        void (async () => {
          const result = await duplicateExperience(experience.id)
          if (!result.ok) {
            toast.error(result.message)
            return
          }

          setExperiences((current) => {
            const next = [result.data, ...current]
            experiencesRef.current = next
            return next
          })
          toast.success("Experience duplicated")
        })()
      })
    },
    [startQuickTransition],
  )

  const columns = React.useMemo(
    () =>
      createExperienceColumns({
        onEdit: openEditDrawer,
        onDuplicate: openDuplicateDrawer,
        onQuickDuplicate: handleQuickDuplicate,
        onDelete: handleDelete,
      }),
    [handleDelete, handleQuickDuplicate, openDuplicateDrawer, openEditDrawer],
  )

  const drawerDefaultValues = React.useMemo((): ExperienceFormValues => {
    if (!drawerState) return EMPTY_FORM
    if (drawerState.mode === "create") return EMPTY_FORM
    const experience = drawerState.experience!
    return {
      company: experience.company ?? "",
      role: experience.role ?? "",
      startDate: toDateInputValue(experience.startDate),
      endDate: toDateInputValue(experience.endDate),
      description: experience.description ?? "",
    }
  }, [drawerState])

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiences</h1>
          <p className="text-sm text-muted-foreground">
            Keep your professional history up to date for visitors reviewing your background.
          </p>
        </div>
        <DataTable
          columns={columns}
          data={experiences}
          searchKey="company"
          searchPlaceholder="Search experiences..."
          emptyState={{
            title: "No experiences yet",
            description: "Document your journey by adding your first role.",
            action: (
              <Button onClick={openCreateDrawer} size="sm">
                Create your first experience
              </Button>
            ),
          }}
          primaryAction={
            <Button size="sm" onClick={openCreateDrawer}>
              New experience
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

      <ExperienceFormDrawer
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
            <AlertDialogTitle>Delete experience</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The entry &ldquo;{deleteTarget?.company}&rdquo; will be removed.
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
            <AlertDialogTitle>Delete {bulkDeleteState?.rows.length ?? 0} experiences?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected records and cannot be undone.
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
