import Link from "next/link"
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import { adminNavItems } from "@/app/admin/nav-items"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"
import { Button } from "@/components/ui/button"
import { getAdminSession } from "@/lib/auth"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

export const dynamic = "force-dynamic"

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 text-amber-500" aria-hidden />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Supabase configuration required</h1>
            <p className="text-sm text-muted-foreground">{SUPABASE_CONFIG_ERROR_MESSAGE}</p>
          </div>
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    )
  }

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
