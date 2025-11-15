"use client"

import { useEffect, useMemo, useState } from "react"
import { PromoPlacement } from "@prisma/client"
import { z } from "zod"
import { toast } from "sonner"

import { EditDialog } from "@/components/admin/edit-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const linkHrefSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .refine((value) => {
    if (!value) {
      return true
    }

    if (value.startsWith("/") || value.startsWith("#")) {
      return true
    }

    try {
      new URL(value)
      return true
    } catch (error) {
      return false
    }
  }, "Enter a valid URL, anchor, or relative path")

const promoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  linkLabel: z.string().optional(),
  linkHref: linkHrefSchema,
  isEnabled: z.boolean().default(true),
  placement: z.nativeEnum(PromoPlacement),
  displayOrder: z.coerce.number().min(0, "Order must be 0 or greater"),
})

type PromoFormValues = z.infer<typeof promoSchema>

type Promo = PromoFormValues & {
  id: number
  createdAt: string
  updatedAt: string
}

type PlacementSection = {
  title: string
  description: string
  placement: PromoPlacement
  maxItems?: number
}

const SECTIONS: PlacementSection[] = [
  {
    title: "Top Promo Bar",
    description: "Appears above the site navigation as a slim announcement bar.",
    placement: PromoPlacement.TOP_BAR,
    maxItems: 1,
  },
  {
    title: "Bottom Promo Bar",
    description: "Renders just above the footer for exit-intent messaging.",
    placement: PromoPlacement.BOTTOM_BAR,
    maxItems: 1,
  },
  {
    title: "Pre-footer Highlights",
    description: "A grid of cards shown before the footer for featured promos or offers.",
    placement: PromoPlacement.PRE_FOOTER_CARD,
  },
]

const DEFAULT_FORM_VALUES: PromoFormValues = {
  title: "",
  description: "",
  linkLabel: "",
  linkHref: "",
  isEnabled: true,
  placement: PromoPlacement.PRE_FOOTER_CARD,
  displayOrder: 0,
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)
  const [dialogPlacement, setDialogPlacement] = useState<PromoPlacement>(
    PromoPlacement.PRE_FOOTER_CARD,
  )

  useEffect(() => {
    void fetchPromos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groupedPromos = useMemo(() => {
    return SECTIONS.reduce<Record<PromoPlacement, Promo[]>>((acc, section) => {
      acc[section.placement] = promos
        .filter((promo) => promo.placement === section.placement)
        .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
      return acc
    }, {
      [PromoPlacement.TOP_BAR]: [],
      [PromoPlacement.BOTTOM_BAR]: [],
      [PromoPlacement.PRE_FOOTER_CARD]: [],
    })
  }, [promos])

  const fetchPromos = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/promos")
      if (!res.ok) {
        throw new Error("Failed to load promos")
      }
      const data = (await res.json()) as Promo[]
      setPromos(data)
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

  const openCreateDialog = (placement: PromoPlacement) => {
    setEditingPromo(null)
    setDialogPlacement(placement)
    setIsDialogOpen(true)
  }

  const openEditDialog = (promo: Promo) => {
    setEditingPromo(promo)
    setDialogPlacement(promo.placement)
    setIsDialogOpen(true)
  }

  const handleDelete = async (promo: Promo) => {
    const confirmation = window.confirm(
      `Delete promo "${promo.title}"? This cannot be undone.`,
    )
    if (!confirmation) {
      return
    }

    try {
      const res = await fetch(`/api/promos/${promo.id}`, { method: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to delete promo")
      }
      toast.success("Promo deleted")
      void fetchPromos()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed"
      toast.error(message)
    }
  }

  const handleSubmit = async (values: PromoFormValues) => {
    if (values.linkLabel && !values.linkHref) {
      toast.error("Provide a link URL when a link label is set")
      throw new Error("Missing link URL")
    }

    const payload = {
      ...values,
      title: values.title.trim(),
      description: values.description?.trim() || null,
      linkLabel: values.linkLabel?.trim() || null,
      linkHref: values.linkHref?.trim() || null,
      placement: values.placement,
      isEnabled: values.isEnabled,
      displayOrder: values.displayOrder,
    }

    const url = editingPromo ? `/api/promos/${editingPromo.id}` : "/api/promos"
    const method = editingPromo ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let message = editingPromo
          ? "Failed to update promo"
          : "Failed to create promo"
        try {
          const data = await res.json()
          if (data?.error) {
            message = data.error
          }
        } catch (error) {
          // ignore
        }
        throw new Error(message)
      }

      toast.success(editingPromo ? "Promo updated" : "Promo created")
      setIsDialogOpen(false)
      void fetchPromos()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed"
      toast.error(message)
      throw err
    }
  }

  const dialogDefaults = editingPromo
    ? {
        title: editingPromo.title,
        description: editingPromo.description ?? "",
        linkLabel: editingPromo.linkLabel ?? "",
        linkHref: editingPromo.linkHref ?? "",
        isEnabled: editingPromo.isEnabled,
        placement: editingPromo.placement,
        displayOrder: editingPromo.displayOrder,
      }
    : {
        ...DEFAULT_FORM_VALUES,
        placement: dialogPlacement,
      }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Promotions</h1>
        <p className="text-sm text-muted-foreground">
          Toggle announcement bars and feature cards across the site.
        </p>
        {error && !isLoading ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const sectionPromos = groupedPromos[section.placement] ?? []
          const hasCapacity =
            typeof section.maxItems === "number"
              ? sectionPromos.length < section.maxItems
              : true

          return (
            <Card key={section.placement}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => openCreateDialog(section.placement)}
                  disabled={!hasCapacity}
                >
                  {hasCapacity ? "Add promo" : "Limit reached"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading promos…</p>
                ) : sectionPromos.length === 0 ? (
                  <p className="text-sm text-muted-foreground/80">
                    No promos configured yet.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sectionPromos.map((promo) => (
                      <div
                        key={promo.id}
                        className="flex h-full flex-col justify-between rounded-xl border bg-card p-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{promo.title}</h3>
                            <Badge variant={promo.isEnabled ? "default" : "secondary"}>
                              {promo.isEnabled ? "Visible" : "Hidden"}
                            </Badge>
                          </div>
                          {promo.description ? (
                            <p className="text-sm text-muted-foreground">
                              {promo.description}
                            </p>
                          ) : null}
                          {promo.linkLabel && promo.linkHref ? (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Link:</span> {promo.linkLabel} → {promo.linkHref}
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Order: {promo.displayOrder}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(promo)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(promo)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <EditDialog
        title={editingPromo ? "Edit promo" : "Add promo"}
        schema={promoSchema}
        defaultValues={dialogDefaults}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingPromo(null)
            setDialogPlacement(PromoPlacement.PRE_FOOTER_CARD)
          }
        }}
        onSubmit={handleSubmit}
      >
        {(form) => (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Promo headline" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional supporting copy"
                rows={3}
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkLabel">Link label</Label>
                <Input id="linkLabel" placeholder="Call-to-action" {...form.register("linkLabel")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkHref">Link URL</Label>
                <Input
                  id="linkHref"
                  placeholder="https:// or /path"
                  {...form.register("linkHref")}
                />
                {form.formState.errors.linkHref ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.linkHref.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min={0}
                  {...form.register("displayOrder", { valueAsNumber: true })}
                />
                {form.formState.errors.displayOrder ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.displayOrder.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="placement">Placement</Label>
                <select
                  id="placement"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...form.register("placement")}
                >
                  {SECTIONS.map((section) => (
                    <option key={section.placement} value={section.placement}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isEnabled"
                checked={form.watch("isEnabled")}
                onCheckedChange={(checked) =>
                  form.setValue("isEnabled", Boolean(checked), {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
              />
              <Label htmlFor="isEnabled" className="text-sm">
                Visible on site
              </Label>
            </div>
          </div>
        )}
      </EditDialog>
    </div>
  )
}
