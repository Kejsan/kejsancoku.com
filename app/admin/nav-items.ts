import type { LucideIcon } from "lucide-react"
import {
  AppWindow,
  FileText,
  Hammer,
  History,
  House,
  Layers,
  LayoutTemplate,
} from "lucide-react"

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
  description?: string
}

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: House,
    description: "Overview of recent activity and stats",
  },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: FileText,
    description: "Manage blog posts and drafts",
  },
  {
    href: "/admin/experiences",
    label: "Experiences",
    icon: Layers,
    description: "Curate professional experiences",
  },
  {
    href: "/admin/apps",
    label: "Apps",
    icon: AppWindow,
    description: "Showcase or update applications",
  },
  {
    href: "/admin/tools",
    label: "Tools",
    icon: Hammer,
    description: "Edit marketing tools collection",
  },
  {
    href: "/admin/worksamples",
    label: "Work Samples",
    icon: LayoutTemplate,
    description: "Highlight portfolio work",
  },
  {
    href: "/admin/audit",
    label: "Audit Trail",
    icon: History,
    description: "Review recent administrative changes",
  },
]
