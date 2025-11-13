"use client"

import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"
import { adminNavItems } from "@/app/admin/nav-items"

type DashboardLayoutProps = {
  children: ReactNode
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar items={adminNavItems} />
      <div className="flex flex-1 flex-col">
        <AdminTopbar items={adminNavItems} user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
