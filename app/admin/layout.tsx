import { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getSafeAdminSession } from "@/lib/safe-session"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { ok, session } = await getSafeAdminSession()

  if (!ok || !session) {
    redirect("/api/auth/signin?callbackUrl=/admin")
  }

  return <>{children}</>
}
