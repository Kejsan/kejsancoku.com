import Link from "next/link"
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import { adminNavItems } from "@/app/admin/nav-items"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
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

  let session = null
  let sessionError: Error | null = null

  try {
    session = await getAdminSession()
  } catch (error) {
    console.error("[dashboard-layout] Failed to retrieve admin session:", error)
    sessionError = error instanceof Error ? error : new Error("Failed to retrieve admin session")
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Authentication error</h1>
            <p className="text-sm text-muted-foreground">
              We encountered an error while checking your admin credentials. Please try signing in again.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/admin/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.username ?? session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardLayout>
  )
}
