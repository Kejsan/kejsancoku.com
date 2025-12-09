"use client"

import * as React from "react"
import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  createWebApp,
  deleteWebApp,
  duplicateWebApp,
  toggleWebAppPublished,
  updateWebApp,
} from "../actions"
import { webAppFormSchema, type WebAppFormValues } from "../schema"
import type { SerializedWebApp } from "../serializers"
import { AppFormDrawer, type AppFormDrawerMode } from "./app-form-drawer"

export type AppRow = SerializedWebApp

const EMPTY_FORM: WebAppFormValues = {
  name: "",
  url: "",
  description: "",
  image: "",
  blogPostSlug: "",
}

type DrawerState = {
  mode: AppFormDrawerMode
  app?: AppRow
}

type AppsShellProps = {
  initialApps: SerializedWebApp[]
}

export function AppsShell({ initialApps }: AppsShellProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [apps, setApps] = React.useState<AppRow[]>(initialApps)
  const appsRef = React.useRef(apps)
  React.useEffect(() => {
    appsRef.current = apps
  }, [apps])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<AppRow | null>(null)

  const [isPending, startTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const filteredApps = React.useMemo(() => {
    if (!searchQuery) return apps
    const lower = searchQuery.toLowerCase()
    return apps.filter((app) => app.name.toLowerCase().includes(lower) || app.description?.toLowerCase().includes(lower))
  }, [apps, searchQuery])

  const openCreateDrawer = React.useCallback(() => setDrawerState({ mode: "create" }), [])

  // Check URL params for create trigger
  React.useEffect(() => {
    if (searchParams.get("create") === "true") {
      openCreateDrawer()
      router.replace("/admin/apps")
    }
  }, [searchParams, openCreateDrawer, router])

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
        image: parsed.data.image && parsed.data.image.length > 0 ? parsed.data.image : null,
        blogPostSlug: parsed.data.blogPostSlug ?? null,
        published: true,
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

  const handleTogglePublished = React.useCallback(
    (app: AppRow) => {
      const snapshot = appsRef.current
      const optimistic = snapshot.map((a) =>
        a.id === app.id
          ? { ...a, published: !a.published }
          : a,
      )
      setApps(optimistic)
      appsRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await toggleWebAppPublished(app.id)
          if (!result.ok) {
            setApps(snapshot)
            appsRef.current = snapshot
            toast.error(result.message)
            return
          }

          setApps((current) => {
            const next = current.map((a) => (a.id === result.data.id ? result.data : a))
            appsRef.current = next
            return next
          })
          toast.success(result.data.published ? "App is now visible" : "App is now hidden")
        })()
      })
    },
    [startTransition],
  )

  const drawerDefaultValues = React.useMemo((): WebAppFormValues => {
    if (!drawerState) return EMPTY_FORM
    if (drawerState.mode === "create") return EMPTY_FORM
    const app = drawerState.app!
    return {
      name: app.name ?? "",
      url: app.url ?? "",
      description: app.description ?? "",
      image: app.image ?? "",
      blogPostSlug: app.blogPostSlug ?? "",
    }
  }, [drawerState])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
            <p className="text-sm text-muted-foreground">
              Showcase the tools and products you maintain or recommend.
            </p>
          </div>
          <Button onClick={openCreateDrawer}>
            New app
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-16 text-center text-muted-foreground">
            <p className="text-base font-medium">No apps found</p>
            <p className="max-w-lg text-sm text-muted-foreground/80">
              {searchQuery ? "Try a different search term." : "Add your first app to populate this list."}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={openCreateDrawer}>
                Create your first app
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredApps.map((app) => (
              <AdminCard
                key={app.id}
                title={app.name}
                description={app.description}
                href={app.url}
                image={app.image}
                status={app.published ? "published" : "hidden"}
                actions={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublished(app)}
                    >
                      {app.published ? "Hide" : "Show"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDrawer(app)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(app)}
                    >
                      Delete
                    </Button>
                  </>
                }
                footer={
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(app.updatedAt).toLocaleDateString()}
                  </span>
                }
              />
            ))}
          </div>
        )}
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
    </>
  )
}
