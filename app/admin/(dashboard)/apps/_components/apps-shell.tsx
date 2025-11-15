"use client"

import * as React from "react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
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
  bulkDeleteWebApps,
  createWebApp,
  deleteWebApp,
  duplicateWebApp,
  updateWebApp,
} from "../actions"
import { webAppFormSchema, type WebAppFormValues } from "../schema"
import type { SerializedWebApp } from "../serializers"
import { AppFormDrawer, type AppFormDrawerMode } from "./app-form-drawer"
import { createAppColumns, type AppRow } from "./app-columns"

const EMPTY_FORM: WebAppFormValues = {
  name: "",
  url: "",
  description: "",
}

type DrawerState = {
  mode: AppFormDrawerMode
  app?: AppRow
}

type BulkDeleteState = {
  rows: AppRow[]
  clearSelection: () => void
}

type AppsShellProps = {
  initialApps: SerializedWebApp[]
}

export function AppsShell({ initialApps }: AppsShellProps) {
  const [apps, setApps] = React.useState<AppRow[]>(initialApps)
  const appsRef = React.useRef(apps)
  React.useEffect(() => {
    appsRef.current = apps
  }, [apps])
  const router = useRouter()

  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<AppRow | null>(null)
  const [bulkDeleteState, setBulkDeleteState] = React.useState<BulkDeleteState | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const openCreateDrawer = React.useCallback(() => setDrawerState({ mode: "create" }), [])
  const openEditDrawer = React.useCallback((app: AppRow) => setDrawerState({ mode: "edit", app }), [])
  const openDuplicateDrawer = React.useCallback((app: AppRow) => {
    setDrawerState({
      mode: "duplicate",
      app: {
        ...app,
        name: `${app.name} (Copy)`
          .trim()
          .slice(0, 120),
      },
    })
  }, [])
  const closeDrawer = React.useCallback(() => setDrawerState(null), [])

  const handleCreate = React.useCallback(
    (values: WebAppFormValues) => {
      const parsed = webAppFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const placeholder: AppRow = {
        id: -Math.floor(Math.random() * 1_000_000),
        name: parsed.data.name,
        url: parsed.data.url && parsed.data.url.length > 0 ? parsed.data.url : null,
        description: parsed.data.description?.length ? parsed.data.description : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const snapshot = appsRef.current
      const optimistic = [placeholder, ...snapshot]
      setApps(optimistic)
      appsRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await createWebApp(parsed.data)
          if (!result.ok) {
            setApps(snapshot)
            appsRef.current = snapshot
            toast.error(result.message)
            return
          }

          setApps((current) => {
            const withoutPlaceholder = current.filter((app) => app.id !== placeholder.id)
            const next = [result.data, ...withoutPlaceholder]
            appsRef.current = next
            return next
          })
          toast.success("App created")
          closeDrawer()
        })()
      })
    },
    [closeDrawer, startTransition],
  )

  const handleUpdate = React.useCallback(
    (values: WebAppFormValues) => {
      if (!drawerState?.app) return
      const parsed = webAppFormSchema.safeParse(values)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid data")
        return
      }

      const snapshot = appsRef.current
      const optimistic = snapshot.map((app) =>
        app.id === drawerState.app?.id
          ? {
              ...app,
              name: parsed.data.name,
              url: parsed.data.url && parsed.data.url.length > 0 ? parsed.data.url : null,
              description: parsed.data.description?.length ? parsed.data.description : null,
              updatedAt: new Date().toISOString(),
            }
          : app,
      )
      setApps(optimistic)
      appsRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await updateWebApp(drawerState.app!.id, parsed.data)
          if (!result.ok) {
            setApps(snapshot)
            appsRef.current = snapshot
            toast.error(result.message)
            return
          }

          setApps((current) => {
            const next = current.map((app) => (app.id === result.data.id ? result.data : app))
            appsRef.current = next
            return next
          })
          toast.success("App updated")
          closeDrawer()
        })()
      })
    },
    [drawerState?.app, closeDrawer, startTransition],
  )

  const handleDuplicateFromDrawer = React.useCallback(
    (values: WebAppFormValues) => {
      handleCreate(values)
    },
    [handleCreate],
  )

  const handleDelete = React.useCallback((app: AppRow) => setDeleteTarget(app), [])

  const confirmDelete = React.useCallback(() => {
    if (!deleteTarget) return
    const snapshot = appsRef.current
    const remaining = snapshot.filter((app) => app.id !== deleteTarget.id)
    setApps(remaining)
    appsRef.current = remaining

    startTransition(() => {
      void (async () => {
        const result = await deleteWebApp(deleteTarget.id)
        if (!result.ok) {
          setApps(snapshot)
          appsRef.current = snapshot
          toast.error(result.message)
          return
        }
        toast.success("App deleted")
        setDeleteTarget(null)
      })()
    })
  }, [deleteTarget, startTransition])

  const confirmBulkDelete = React.useCallback(() => {
    if (!bulkDeleteState) return
    const ids = bulkDeleteState.rows.map((row) => row.id)
    const snapshot = appsRef.current
    const remaining = snapshot.filter((app) => !ids.includes(app.id))
    setApps(remaining)
    appsRef.current = remaining

    startBulkTransition(() => {
      void (async () => {
        const result = await bulkDeleteWebApps(ids)
        if (!result.ok) {
          setApps(snapshot)
          appsRef.current = snapshot
          toast.error(result.message)
          return
        }

        toast.success(
          result.data.count > 0
            ? `Deleted ${result.data.count} ${result.data.count === 1 ? "app" : "apps"}`
            : "No apps deleted",
        )
        bulkDeleteState.clearSelection()
        setBulkDeleteState(null)
      })()
    })
  }, [bulkDeleteState, startBulkTransition])

  const handleQuickDuplicate = React.useCallback(
    (app: AppRow) => {
      startQuickTransition(() => {
        void (async () => {
          const result = await duplicateWebApp(app.id)
          if (!result.ok) {
            toast.error(result.message)
            return
          }

          setApps((current) => {
            const next = [result.data, ...current]
            appsRef.current = next
            return next
          })
          toast.success("App duplicated")
        })()
      })
    },
    [startQuickTransition],
  )

  const handleView = React.useCallback(
    (app: AppRow) => {
      if (!app.id || app.id <= 0) return
      router.push(`/apps/${app.id}`)
    },
    [router],
  )

  const columns = React.useMemo(
    () =>
      createAppColumns({
        onView: handleView,
        onEdit: openEditDrawer,
        onDuplicate: openDuplicateDrawer,
        onQuickDuplicate: handleQuickDuplicate,
        onDelete: handleDelete,
      }),
    [handleDelete, handleQuickDuplicate, handleView, openDuplicateDrawer, openEditDrawer],
  )

  const drawerDefaultValues = React.useMemo((): WebAppFormValues => {
    if (!drawerState) return EMPTY_FORM
    if (drawerState.mode === "create") return EMPTY_FORM
    const app = drawerState.app!
    return {
      name: app.name ?? "",
      url: app.url ?? "",
      description: app.description ?? "",
    }
  }, [drawerState])

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          <p className="text-sm text-muted-foreground">
            Showcase the tools and products you maintain or recommend.
          </p>
        </div>
        <DataTable
          columns={columns}
          data={apps}
          searchKey="name"
          searchPlaceholder="Search apps..."
          emptyState={{
            title: "No apps yet",
            description: "Add your first app to populate this list.",
            action: (
              <Button onClick={openCreateDrawer} size="sm">
                Create your first app
              </Button>
            ),
          }}
          primaryAction={
            <Button size="sm" onClick={openCreateDrawer}>
              New app
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

      <AppFormDrawer
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
            <AlertDialogTitle>Delete app</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The app &ldquo;{deleteTarget?.name}&rdquo; will be removed.
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
            <AlertDialogTitle>Delete {bulkDeleteState?.rows.length ?? 0} apps?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected apps and cannot be undone.
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
