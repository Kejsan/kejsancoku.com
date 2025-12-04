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
  // If Supabase is not configured, we still allow rendering but features might fail.
  // We'll show a toast or banner inside the dashboard instead of blocking the whole layout.
  // This allows the admin to at least see the UI and maybe fix settings.
  
  /* 
  // OLD BLOCKING LOGIC - REMOVED TO PREVENT NAVIGATION BREAKAGE
  if (!isSupabaseConfigured) {
    return (
      <AdminProviders>
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
          ...
        </div>
      </AdminProviders>
    )
  }
  */

  // For the login page, just render children without auth check
  // The login page will check its own route
  // This is determined by the children being from /admin/login or /admin/(dashboard)
  
  return <AdminProviders>{children}</AdminProviders>
}
