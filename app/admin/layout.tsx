"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AlertTriangle, Loader2 } from "lucide-react"

import { AdminProviders } from "@/components/admin/providers"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabaseClient"
import type { Session } from "@supabase/supabase-js"
import { adminNavItems } from "@/app/admin/nav-items"

type AdminLayoutProps = {
  children: ReactNode
}

type AuthState =
  | { status: "loading" }
  | { status: "authorized"; user: { name?: string | null; email: string; image?: string | null } }
  | { status: "unauthorized" }

type SessionMetadata = {
  username?: string
  full_name?: string
  name?: string
  avatar_url?: string
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginRoute = pathname?.startsWith("/admin/login") ?? false
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" })

  useEffect(() => {
    if (isLoginRoute) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    let isMounted = true

    async function syncSession(session: Session | null) {
      if (!isMounted) {
        return
      }

      if (!session) {
        setAuthState({ status: "unauthorized" })
        await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined)
        router.replace("/admin/login")
        return
      }

      const metadata = (session.user.user_metadata ?? {}) as SessionMetadata

      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session.access_token,
          expiresIn: session.expires_in,
        }),
      }).catch(() => null)

      if (!response || !response.ok) {
        await supabase.auth.signOut().catch((error) => {
          console.error("Failed to clear Supabase session after admin sync error", error)
        })
        setAuthState({ status: "unauthorized" })
        router.replace("/admin/login")
        return
      }

      setAuthState({
        status: "authorized",
        user: {
          email: session.user.email ?? "",
          name: metadata.username ?? metadata.full_name ?? metadata.name ?? null,
          image: metadata.avatar_url ?? null,
        },
      })
    }

    supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [isLoginRoute, router])

  const content = useMemo(() => {
    if (isLoginRoute) {
      return children
    }

    if (authState.status === "loading") {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Checking your admin session…</p>
          </div>
        </div>
      )
    }

    if (authState.status === "unauthorized") {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm">
            <AlertTriangle className="h-12 w-12 text-amber-500" aria-hidden />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">We couldn\'t load your admin session</h1>
              <p className="text-sm text-muted-foreground">
                Your session may have expired or you might not have access. Please sign in again to continue.
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

    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar items={adminNavItems} />
        <div className="flex flex-1 flex-col">
          <AdminTopbar items={adminNavItems} user={authState.user} />
          <main className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    )
  }, [authState, children, isLoginRoute])

  return <AdminProviders>{content}</AdminProviders>
}
