import type { ReactNode } from "react"

import UnifiedNavbar from "@/components/layout/unified-navbar"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900 text-white", className)}>
      <UnifiedNavbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
