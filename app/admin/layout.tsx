import type { ReactNode } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { headers } from "next/headers"

import { AdminProviders } from "@/components/admin/providers"
import { Button } from "@/components/ui/button"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const headersList = headers()
  const pathname = getPathname(headersList)

  const isLoginRoute = pathname?.startsWith("/admin/login") ?? false
  const isDashboardRoute = pathname?.startsWith("/admin") && !isLoginRoute

  if (isDashboardRoute && !isSupabaseConfigured) {
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

function getPathname(headersList: Headers) {
  const nextUrl =
    headersList.get("x-invoke-path") ??
    headersList.get("x-matched-path") ??
    headersList.get("next-url") ??
    headersList.get("referer")

  if (!nextUrl) return null

  try {
    const url = new URL(nextUrl, "http://localhost")
    return url.pathname
  } catch (error) {
    console.error("[admin-layout] Failed to parse pathname from headers", error)
    return null
  }
}
