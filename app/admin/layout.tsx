import type { ReactNode } from "react"

import { AdminProviders } from "@/components/admin/providers"

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>
}
