import type { ReactNode } from "react"
import Link from "next/link"

import { adminNavItems } from "@/app/admin/nav-items"
import { AdminProviders } from "@/components/admin/providers"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"
import { Button } from "@/components/ui/button"
import { getSafeAdminSession } from "@/lib/safe-session"
import { AlertTriangle } from "lucide-react"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const sessionResult = await getSafeAdminSession()

  if (!sessionResult.ok || !sessionResult.session) {
    return (
      <AdminProviders>
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm">
            <AlertTriangle className="h-12 w-12 text-amber-500" aria-hidden />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">
                We couldn&apos;t load your admin session
              </h1>
              <p className="text-sm text-muted-foreground">
                Your session may have expired or you might not have access. Please
                sign in again to continue.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/api/auth/signin?callbackUrl=/admin">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Return home</Link>
              </Button>
            </div>
          </div>
        </div>
      </AdminProviders>
    )
  }

  const { session } = sessionResult

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
    image: session.user?.image ?? null,
  }

  return (
    <AdminProviders>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar items={adminNavItems} />
        <div className="flex flex-1 flex-col">
          <AdminTopbar items={adminNavItems} user={user} />
          <main className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminProviders>
  )
}
