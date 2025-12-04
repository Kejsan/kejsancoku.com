"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"

import { EditDialog } from "@/components/admin/edit-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type Skill } from "@/types/skill"

const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  level: z
    .number({ invalid_type_error: "Level must be a number" })
    .int("Level must be a whole number")
    .min(1, "Level must be at least 1")
    .max(5, "Level must be 5 or lower"),
  category: z.string().optional(),
})

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

  useEffect(() => {
    void fetchSkills()
    
    // Check URL params for create trigger
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("create") === "true") {
      setEditingSkill(null)
      setIsDialogOpen(true)
      // Remove query param without full reload
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [])

  const fetchSkills = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/skills?admin=true")
      if (!res.ok) {
        throw new Error("Failed to load skills")
      }
      const data = await res.json()
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format")
      }
      setSkills(data)
      setError(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const dialogDefaults = useMemo(
    () => ({
      name: editingSkill?.name || "",
      slug: editingSkill?.slug || "",
      description: editingSkill?.description || "",
      icon: editingSkill?.icon || "",
      level: editingSkill?.level ?? 3,
      category: editingSkill?.category || "",
    }),
    [editingSkill],
  )

  const handleAdd = () => {
    setEditingSkill(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        const res = await fetch(`/api/skills/${id}`, { method: "DELETE" })
        if (!res.ok) {
          let message = "Failed to delete skill"
          try {
            const data = await res.json()
            if (data?.message) {
              message = data.message
            }
          } catch (error) {
            // Ignore parsing errors
          }
          toast.error(message)
          return
        }
        toast.success("Skill deleted")
        await fetchSkills()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete skill"
        toast.error(message)
      }
    }
  }

  const handleSubmit = async (values: z.infer<typeof skillSchema>) => {
    const url = editingSkill ? `/api/skills/${editingSkill.id}` : "/api/skills"
    const method = editingSkill ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        let message = editingSkill
          ? "Failed to update skill"
          : "Failed to create skill"
        try {
          const data = await res.json()
          if (data?.message) {
            message = data.message
          }
        } catch (error) {
          // Ignore parsing errors
        }
        throw new Error(message)
      }

      toast.success(editingSkill ? "Skill updated" : "Skill created")
      await fetchSkills()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save skill"
      toast.error(message)
      throw (err instanceof Error ? err : new Error(message))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Skills</h1>
          <p className="text-sm text-muted-foreground">
            Curate the abilities that power your work and surface them across the site.
          </p>
        </div>
        <Button onClick={handleAdd}>Add Skill</Button>
      </div>

      {error && skills.length > 0 && !isLoading ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}. Showing the most recent data.
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-muted/40 bg-muted/40 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-6 w-12 rounded bg-muted" />
              </div>
              <div className="h-3 w-full rounded bg-muted" />
              <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-16 text-center text-muted-foreground">
          <p className="text-base font-medium">
            {error ? "Unable to load skills." : "No skills documented yet."}
          </p>
          <p className="max-w-lg text-sm text-muted-foreground/80">
            Add your proficiencies so visitors can quickly understand your toolkit.
          </p>
          <Button size="sm" onClick={handleAdd}>
            Add your first skill
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg">
                    {skill.icon || "★"}
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold leading-tight">{skill.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {skill.category || "General"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Level {skill.level}
                </span>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {skill.description || "No description provided yet."}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-1 font-mono">{skill.slug}</span>
                <span className="rounded-full bg-muted px-2 py-1">ID: {skill.id}</span>
              </div>
              <div className="mt-auto flex items-center gap-2">
                <Button
                  variant={skill.published ? "secondary" : "default"}
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/skills/${skill.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...skill, published: !skill.published }),
                      })
                      if (!res.ok) throw new Error("Failed to toggle")
                      toast.success(skill.published ? "Skill hidden" : "Skill shown")
                      fetchSkills()
                    } catch (err) {
                      toast.error("Failed to toggle skill")
                    }
                  }}
                >
                  {skill.published ? "Hide" : "Show"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(skill)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditDialog<z.infer<typeof skillSchema>>
        title={editingSkill ? "Edit Skill" : "Add New Skill"}
        schema={skillSchema}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={dialogDefaults}
      >
        {(form) => (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input id="slug" placeholder="auto-generated from name" {...form.register("slug")} />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...form.register("description")} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon or Emoji</Label>
                <Input id="icon" placeholder="e.g. 🚀" {...form.register("icon")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level (1-5)</Label>
                <Input
                  id="level"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  {...form.register("level", { valueAsNumber: true })}
                />
                {form.formState.errors.level && (
                  <p className="text-sm text-red-500">{form.formState.errors.level.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. Growth" {...form.register("category")} />
              </div>
            </div>
          </div>
        )}
      </EditDialog>
    </div>
  )
}
