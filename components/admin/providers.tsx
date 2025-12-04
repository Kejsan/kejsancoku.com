"use client"

import { ThemeProvider } from "@/components/theme-provider"
import type { ReactNode } from "react"
import { Toaster } from "sonner"

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="kejsan-admin-theme"
    >
      {children}
      <Toaster richColors position="top-right" expand={false} />
    </ThemeProvider>
  )
}
