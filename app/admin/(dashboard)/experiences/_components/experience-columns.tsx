"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CalendarRange, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

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
import type { SerializedExperience } from "../serializers"

export type ExperienceRow = SerializedExperience

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
})

type ColumnHandlers = {
  onEdit: (experience: ExperienceRow) => void
  onDuplicate: (experience: ExperienceRow) => void
  onQuickDuplicate: (experience: ExperienceRow) => void
  onDelete: (experience: ExperienceRow) => void
}

export function createExperienceColumns({
  onEdit,
  onDuplicate,
  onQuickDuplicate,
  onDelete,
}: ColumnHandlers): ColumnDef<ExperienceRow, unknown>[] {
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
          aria-label={`Select ${row.original.company}`}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{row.original.company}</span>
          <span className="text-xs text-muted-foreground">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Duration",
      cell: ({ row }) => {
        const start = new Date(row.original.startDate)
        const end = row.original.endDate ? new Date(row.original.endDate) : null
        const startLabel = Number.isNaN(start.valueOf()) ? "–" : dateFormatter.format(start)
        const endLabel = end && !Number.isNaN(end.valueOf()) ? dateFormatter.format(end) : "Present"
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" aria-hidden />
            <span>
              {startLabel} – {endLabel}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Summary",
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {row.original.description ?? "–"}
        </span>
      ),
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
    },
  ]
}
