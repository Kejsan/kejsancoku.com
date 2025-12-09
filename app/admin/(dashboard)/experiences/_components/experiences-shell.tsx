"use client"

import * as React from "react"
import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Prisma } from "@prisma/client"

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
  bulkDeleteExperiences,
  createExperience,
  deleteExperience,
  duplicateExperience,
  toggleExperiencePublished,
  updateExperience,
} from "../actions"
import { experienceFormSchema, type ExperienceFormValues } from "../schema"
import type { SerializedExperience } from "../serializers"
import {
  formatCareerProgressionForForm,
  formatMultilineForForm,
  formatPreviousRoleForForm,
  formatRolesForForm,
  parseCareerProgressionJson,
  parsePreviousRoleJson,
  splitMultiline,
} from "../parsers"
import { ExperienceFormDrawer, type ExperienceFormDrawerMode } from "./experience-form-drawer"

export type ExperienceRow = SerializedExperience

const EMPTY_FORM: ExperienceFormValues = {
  company: "",
  title: "",
  period: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  achievements: [],
  fullDescription: "",
  responsibilities: "",
  skills: [],
  careerProgression: "",
  previousRole: "",
  roles: "",
}

function sanitizeStringList(values: readonly string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) {
      continue
    }
    seen.add(trimmed)
    result.push(trimmed)
  }

  return result
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [experiences, setExperiences] = React.useState<ExperienceRow[]>(initialExperiences)
  const experiencesRef = React.useRef(experiences)
  React.useEffect(() => {
    experiencesRef.current = experiences
  }, [experiences])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<ExperienceRow | null>(null)

  const [isPending, startTransition] = useTransition()
  const [, startQuickTransition] = useTransition()

  const filteredExperiences = React.useMemo(() => {
    if (!searchQuery) return experiences
    const lower = searchQuery.toLowerCase()
    return experiences.filter((exp) =>
      exp.company.toLowerCase().includes(lower) ||
      exp.title.toLowerCase().includes(lower)
    )
  }, [experiences, searchQuery])

  const openCreateDrawer = React.useCallback(() => setDrawerState({ mode: "create" }), [])



  // Check URL params for create trigger
  React.useEffect(() => {
    if (searchParams.get("create") === "true") {
      openCreateDrawer()
      router.replace("/admin/experiences")
    }
  }, [searchParams, openCreateDrawer, router])
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

      const achievements = sanitizeStringList(parsed.data.achievements)
      const responsibilities = splitMultiline(parsed.data.responsibilities)
      const skills = sanitizeStringList(parsed.data.skills)
      const careerProgression = parseCareerProgressionJson(parsed.data.careerProgression)
      if (!careerProgression.ok) {
        toast.error(careerProgression.message)
        return
      }
      const previousRole = parsePreviousRoleJson(parsed.data.previousRole)
      if (!previousRole.ok) {
        toast.error(previousRole.message)
        return
      }

      const now = new Date()
      let rolesValue: Prisma.JsonValue | null = null

      if (parsed.data.roles?.trim()) {
        try {
          // If roles is a JSON string (e.g. '["SEO Specialist","Content Lead"]')
          rolesValue = JSON.parse(parsed.data.roles) as Prisma.JsonValue
        } catch {
          // Fallback if it's just a raw string – still treat it as JSON-compatible
          rolesValue = parsed.data.roles as unknown as Prisma.JsonValue
        }
      }

      const placeholder: ExperienceRow = {
        id: -Math.floor(Math.random() * 1_000_000),
        company: parsed.data.company.trim(),
        title: parsed.data.title.trim(),
        period: parsed.data.period?.trim() ? parsed.data.period.trim() : null,
        location: parsed.data.location?.trim() ? parsed.data.location.trim() : null,
        startDate: new Date(parsed.data.startDate).toISOString(),
        endDate: parsed.data.endDate?.trim()
          ? new Date(parsed.data.endDate).toISOString()
          : null,
        description: parsed.data.description?.trim()?.length
          ? parsed.data.description.trim()
          : null,
        achievements,
        fullDescription: parsed.data.fullDescription?.trim()?.length
          ? parsed.data.fullDescription.trim()
          : null,
        responsibilities,
        skills,
        careerProgression: careerProgression.data,
        previousRole: previousRole.data,
        roles: rolesValue as Prisma.JsonValue,
        published: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
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

      const achievements = sanitizeStringList(parsed.data.achievements)
      const responsibilities = splitMultiline(parsed.data.responsibilities)
      const skills = sanitizeStringList(parsed.data.skills)
      const careerProgression = parseCareerProgressionJson(parsed.data.careerProgression)
      if (!careerProgression.ok) {
        toast.error(careerProgression.message)
        return
      }
      const previousRole = parsePreviousRoleJson(parsed.data.previousRole)
      if (!previousRole.ok) {
        toast.error(previousRole.message)
        return
      }

      const snapshot = experiencesRef.current
      const optimistic = snapshot.map((experience) =>
        experience.id === drawerState.experience?.id
          ? {
            ...experience,
            company: parsed.data.company.trim(),
            title: parsed.data.title.trim(),
            period: parsed.data.period?.trim() ? parsed.data.period.trim() : null,
            location: parsed.data.location?.trim() ? parsed.data.location.trim() : null,
            startDate: new Date(parsed.data.startDate).toISOString(),
            endDate: parsed.data.endDate?.trim()
              ? new Date(parsed.data.endDate).toISOString()
              : null,
            description: parsed.data.description?.trim()?.length
              ? parsed.data.description.trim()
              : null,
            achievements,
            fullDescription: parsed.data.fullDescription?.trim()?.length
              ? parsed.data.fullDescription.trim()
              : null,
            responsibilities,
            skills,
            careerProgression: careerProgression.data,
            previousRole: previousRole.data,
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

  const handleTogglePublished = React.useCallback(
    (experience: ExperienceRow) => {
      const snapshot = experiencesRef.current
      const optimistic = snapshot.map((exp) =>
        exp.id === experience.id
          ? { ...exp, published: !exp.published }
          : exp,
      )
      setExperiences(optimistic)
      experiencesRef.current = optimistic

      startTransition(() => {
        void (async () => {
          const result = await toggleExperiencePublished(experience.id)
          if (!result.ok) {
            setExperiences(snapshot)
            experiencesRef.current = snapshot
            toast.error(result.message)
            return
          }

          setExperiences((current) => {
            const next = current.map((exp) => (exp.id === result.data.id ? result.data : exp))
            experiencesRef.current = next
            return next
          })
          toast.success(result.data.published ? "Experience is now visible" : "Experience is now hidden")
        })()
      })
    },
    [startTransition],
  )



  const drawerDefaultValues = React.useMemo((): ExperienceFormValues => {
    if (!drawerState || drawerState.mode === "create") {
      return {
        ...EMPTY_FORM,
        achievements: [],
        skills: [],
      }
    }
    const experience = drawerState.experience!
    return {
      company: experience.company ?? "",
      title: experience.title ?? "",
      period: experience.period ?? "",
      location: experience.location ?? "",
      startDate: toDateInputValue(experience.startDate),
      endDate: toDateInputValue(experience.endDate),
      description: experience.description ?? "",
      fullDescription: experience.fullDescription ?? "",
      achievements: experience.achievements
        ? sanitizeStringList(experience.achievements)
        : [],
      responsibilities: formatMultilineForForm(experience.responsibilities),
      skills: experience.skills ? sanitizeStringList(experience.skills) : [],
      careerProgression: formatCareerProgressionForForm(experience.careerProgression),
      previousRole: formatPreviousRoleForForm(experience.previousRole),
      roles: formatRolesForForm(experience.roles),
    }
  }, [drawerState])

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Experiences</h1>
            <p className="text-sm text-muted-foreground">
              Keep your professional history up to date for visitors reviewing your background.
            </p>
          </div>
          <Button onClick={openCreateDrawer}>
            New experience
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filteredExperiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-16 text-center text-muted-foreground">
            <p className="text-base font-medium">No experiences found</p>
            <p className="max-w-lg text-sm text-muted-foreground/80">
              {searchQuery ? "Try a different search term." : "Document your journey by adding your first role."}
            </p>
            {!searchQuery && (
              <Button size="sm" onClick={openCreateDrawer}>
                Create your first experience
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredExperiences.map((exp) => {
              const start = new Date(exp.startDate)
              const end = exp.endDate ? new Date(exp.endDate) : null
              const dateRange = `${start.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - ${end ? end.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}`

              return (
                <AdminCard
                  key={exp.id}
                  title={exp.company}
                  description={exp.title}
                  status={exp.published ? "published" : "hidden"}
                  actions={
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublished(exp)}
                      >
                        {exp.published ? "Hide" : "Show"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDrawer(exp)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(exp)}
                      >
                        Delete
                      </Button>
                    </>
                  }
                  footer={
                    <span className="text-xs text-muted-foreground">
                      {dateRange}
                    </span>
                  }
                />
              )
            })}
          </div>
        )}
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


    </>
  )
}
