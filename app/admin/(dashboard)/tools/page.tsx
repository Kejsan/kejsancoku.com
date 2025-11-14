"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"

import { EditDialog } from "@/components/admin/edit-dialog"
import { ToolCard, ToolCardSkeleton } from "@/components/tools/tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Tool {
  id: number
  name: string
  url: string
  description?: string | null
}

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
})

type ToolFormValues = z.infer<typeof toolSchema>

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/tools")
      if (!res.ok) {
        throw new Error("Failed to load tools")
      }
      const data = await res.json()
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format")
      }
      setTools(data)
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

  const handleAdd = () => {
    setEditingTool(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this tool?")) {
      try {
        const res = await fetch(`/api/tools/${id}`, { method: "DELETE" })
        if (!res.ok) {
          let message = "Failed to delete tool"
          try {
            const data = await res.json()
            if (data?.message) {
              message = data.message
            }
          } catch (error) {
            // Ignore JSON parsing errors
          }
          toast.error(message)
          return
        }
        toast.success("Tool deleted")
        fetchTools()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete tool"
        toast.error(message)
      }
    }
  }

  const handleSubmit = async (values: ToolFormValues) => {
    const url = editingTool ? `/api/tools/${editingTool.id}` : "/api/tools"
    const method = editingTool ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        let message = editingTool
          ? "Failed to update tool"
          : "Failed to create tool"
        try {
          const data = await res.json()
          if (data?.message) {
            message = data.message
          }
        } catch (error) {
          // Ignore JSON parsing errors
        }
        throw new Error(message)
      }

      toast.success(editingTool ? "Tool updated" : "Tool created")
      await fetchTools()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save tool"
      toast.error(message)
      throw (err instanceof Error ? err : new Error(message))
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Tools</h1>
          <p className="text-sm text-muted-foreground">
            Keep your public tools page in sync with the stack you rely on.
          </p>
        </div>
        <Button onClick={handleAdd}>Add Tool</Button>
      </div>

      {error && tools.length > 0 && !isLoading ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}. Showing the most recent data.
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ToolCardSkeleton
              key={index}
              className="border-border bg-muted/60 text-card-foreground"
            />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-16 text-center text-muted-foreground">
          <p className="text-base font-medium">
            {error
              ? "Unable to load tools. Please try again later."
              : "No tools documented yet."}
          </p>
          <p className="max-w-lg text-sm text-muted-foreground/80">
            Add the platforms and software you rely on to help visitors understand your workflow.
          </p>
          <Button size="sm" onClick={handleAdd}>
            Add your first tool
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              className="border-border bg-card text-card-foreground hover:border-primary/40"
              actions={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(tool)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(tool.id)}
                  >
                    Delete
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <EditDialog<ToolFormValues>
        title={editingTool ? "Edit Tool" : "Add New Tool"}
        schema={toolSchema}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{
          name: editingTool?.name || "",
          url: editingTool?.url || "",
          description: editingTool?.description || "",
        }}
      >
        {(form) => (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" {...form.register("url")} />
              {form.formState.errors.url && (
                <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>
          </>
        )}
      </EditDialog>
    </div>
  )
}
