"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { EditDialog } from "@/components/admin/edit-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

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
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Tools</h1>
        <Button onClick={handleAdd}>Add Tool</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {error && tools.length > 0 && !isLoading && (
          <div className="p-4 text-sm text-red-500 border-b border-gray-200 dark:border-gray-700">
            {error}. Showing the most recent data.
          </div>
        )}
        {isLoading ? (
          <div className="p-4 text-sm text-gray-500">Loading tools...</div>
        ) : tools.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            {error
              ? "Unable to load tools. Please try again later."
              : "No tools available."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tools.map((tool) => (
              <li key={tool.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{tool.name}</p>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {tool.url}
                  </a>
                  {tool.description && (
                    <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
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
              </li>
            ))}
          </ul>
        )}
      </div>

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
