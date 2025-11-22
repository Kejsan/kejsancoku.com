"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

type AdminCreateHandler = () => void

type AdminContextValue = {
  registerCreateHandler: (section: string, handler: AdminCreateHandler) => void
  triggerCreate: (section: string) => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const handlers = new Map<string, AdminCreateHandler>()

  const registerCreateHandler = useCallback((section: string, handler: AdminCreateHandler) => {
    handlers.set(section, handler)
  }, [])

  const triggerCreate = useCallback(
    (section: string) => {
      const handler = handlers.get(section)
      if (handler) {
        handler()
      } else {
        // Fallback: navigate to section with create param
        const sectionPath = section === "/admin" ? "/admin" : section
        if (pathname === sectionPath) {
          // If already on the page, use URL param to trigger
          router.push(`${sectionPath}?create=true`)
        } else {
          router.push(`${sectionPath}?create=true`)
        }
      }
    },
    [handlers, pathname, router],
  )

  return (
    <AdminContext.Provider value={{ registerCreateHandler, triggerCreate }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminContext() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider")
  }
  return context
}

