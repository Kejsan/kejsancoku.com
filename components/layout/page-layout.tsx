import type { ReactNode } from "react"

import Navbar from "@/components/Navbar"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background text-foreground", className)}>
      <Navbar />
      <main className="flex-1 pt-20 sm:pt-24">{children}</main>
    </div>
  )
}
