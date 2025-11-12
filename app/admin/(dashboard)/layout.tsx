import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { adminNavItems } from "@/app/admin/nav-items"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"
import { getAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar items={adminNavItems} />
      <div className="flex flex-1 flex-col">
        <AdminTopbar
          items={adminNavItems}
          user={{
            name: session.user.username ?? session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
