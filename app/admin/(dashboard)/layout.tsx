import Link from "next/link"
import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"

import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@/components/ui/button"
import { getAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
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
      <DashboardErrorState
        icon={<AlertTriangle className="h-12 w-12 text-destructive" aria-hidden />}
        title="Authentication error"
        message="We encountered an error while checking your admin credentials. Please try signing in again."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/admin/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        }
      />
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

type DashboardErrorStateProps = {
  icon: ReactNode
  title: string
  message: ReactNode
  actions?: ReactNode
}

function DashboardErrorState({ icon, title, message, actions }: DashboardErrorStateProps) {
  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm">
          {icon}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {actions}
        </div>
      </div>
    </DashboardLayout>
  )
}
