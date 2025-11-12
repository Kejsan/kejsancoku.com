import type { Metadata } from "next"

import { AdminLoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Admin sign in",
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <AdminLoginForm />
    </div>
  )
}
