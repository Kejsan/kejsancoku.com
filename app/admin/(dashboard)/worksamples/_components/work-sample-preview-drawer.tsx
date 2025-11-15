"use client"

import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import type { WorkSampleRow } from "./work-sample-columns"

type WorkSamplePreviewDrawerProps = {
  sample: WorkSampleRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(isoString?: string | null) {
  if (!isoString) return "—"
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function WorkSamplePreviewDrawer({ sample, open, onOpenChange }: WorkSamplePreviewDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{sample?.title ?? "Work sample"}</SheetTitle>
          {sample?.description ? <SheetDescription>{sample.description}</SheetDescription> : null}
        </SheetHeader>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">Link</p>
          {sample?.url ? (
            <Button asChild variant="outline" size="sm" className="w-fit gap-2">
              <a href={sample.url} target="_blank" rel="noreferrer">
                Visit link
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">No link provided</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Created</p>
            <p className="text-foreground">{formatDate(sample?.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Updated</p>
            <p className="text-foreground">{formatDate(sample?.updatedAt)}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
