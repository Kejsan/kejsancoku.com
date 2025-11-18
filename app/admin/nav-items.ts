import type { LucideIcon } from "lucide-react"
import {
  AppWindow,
  FileText,
  Hammer,
  History,
  House,
  Layers,
  LayoutTemplate,
  Megaphone,
  Sparkles,
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
    href: "/admin/skills",
    label: "Skills",
    icon: Sparkles,
    description: "Manage proficiencies and categories",
  },
  {
    href: "/admin/worksamples",
    label: "Work Samples",
    icon: LayoutTemplate,
    description: "Highlight portfolio work",
  },
  {
    href: "/admin/promos",
    label: "Promos",
    icon: Megaphone,
    description: "Control promo bars and featured offers",
  },
  {
    href: "/admin/audit",
    label: "Audit Trail",
    icon: History,
    description: "Review recent administrative changes",
  },
]
