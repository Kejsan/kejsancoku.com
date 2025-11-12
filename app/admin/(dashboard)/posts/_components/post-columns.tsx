"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Calendar, Clock, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SerializedPost } from "../serializers"

export type PostRow = SerializedPost

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const statusCopy: Record<
  PostRow["status"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "outline" },
  published: { label: "Published", variant: "default" },
}

function formatDate(value: string | null) {
  if (!value) return "–"
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return "–"
  return dateFormatter.format(date)
}

function renderVisibility(row: PostRow) {
  if (row.status === "published") {
    const publishedDate = row.publishedAt ?? row.updatedAt
    return (
      <div className="flex flex-col text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" aria-hidden /> Published
        </span>
        <span>{formatDate(publishedDate)}</span>
      </div>
    )
  }

  if (row.status === "scheduled") {
    return (
      <div className="flex flex-col text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden /> Scheduled
        </span>
        <span>{formatDate(row.scheduledAt)}</span>
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground">Updated {formatDate(row.updatedAt)}</div>
  )
}

type ColumnHandlers = {
  onEdit: (post: PostRow) => void
  onDuplicate: (post: PostRow) => void
  onQuickDuplicate: (post: PostRow) => void
  onDelete: (post: PostRow) => void
}

export function createPostColumns({
  onEdit,
  onDuplicate,
  onQuickDuplicate,
  onDelete,
}: ColumnHandlers): ColumnDef<PostRow, unknown>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${row.original.title}`}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48,
    },
    {
      accessorKey: "title",
      header: "Title",
      filterFn: (row, _columnId, filterValue) => {
        const query = String(filterValue ?? "").trim().toLowerCase()
        if (!query) return true
        const { title, slug } = row.original
        return (
          title?.toLowerCase().includes(query) ||
          slug?.toLowerCase().includes(query)
        )
      },
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{row.original.title}</span>
          <span className="text-xs text-muted-foreground">/{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const copy = statusCopy[status] ?? statusCopy.draft
        return (
          <Badge variant={copy.variant} className="w-fit capitalize">
            {copy.label}
          </Badge>
        )
      },
      sortingFn: "alphanumeric",
      filterFn: (row, columnId, filterValue) => {
        const value = String(filterValue ?? "")
        if (!value || value === "all") return true
        return row.getValue<string>(columnId) === value
      },
    },
    {
      id: "visibility",
      header: "Visibility",
      cell: ({ row }) => renderVisibility(row.original),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt)
        return (
          <span className="text-sm text-muted-foreground">
            {Number.isNaN(date.valueOf()) ? "–" : dateFormatter.format(date)}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(row.original)}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate &amp; edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickDuplicate(row.original)}>
              <Copy className="mr-2 h-4 w-4" /> Quick duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 64,
    },
  ]
}

