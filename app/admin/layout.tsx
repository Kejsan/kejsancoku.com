import type { ReactNode } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"

import { AdminProviders } from "@/components/admin/providers"
import { Button } from "@/components/ui/button"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"
import { getAdminSession } from "@/lib/auth"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check if we're on the login route
  const isLoginRoute = false // This will be properly handled by the login page location

  // If Supabase is not configured and we're not on login, show error
  if (!isSupabaseConfigured) {
    return (
      <AdminProviders>
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm">
            <AlertTriangle className="h-12 w-12 text-amber-500" aria-hidden />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Supabase configuration required</h1>
              <p className="text-sm text-muted-foreground">
                {SUPABASE_CONFIG_ERROR_MESSAGE}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/">
                  Go back home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AdminProviders>
    )
  }

  // For the login page, just render children without auth check
  // The login page will check its own route
  // This is determined by the children being from /admin/login or /admin/(dashboard)
  
  return <AdminProviders>{children}</AdminProviders>
}
