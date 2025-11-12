import { cookies } from "next/headers"

import { createSupabaseServerClient } from "@/lib/supabaseClient"

export type AdminSession = {
  user: {
    id: string
    email: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
}

const ADMIN_TOKEN_COOKIE = "sb-admin-token"

function serializeAdminCookie(value: string, maxAge: number) {
  const parts = [
    `${ADMIN_TOKEN_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${Math.max(0, Math.floor(maxAge))}`,
    "SameSite=Lax",
    "HttpOnly",
  ]

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure")
  }

  return parts.join("; ")
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value

  if (!accessToken) {
    return null
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user || !data.user.email) {
    return null
  }

  const email = data.user.email.toLowerCase()
  if (!adminEmails().includes(email)) {
    return null
  }

  const metadata = (data.user.user_metadata ?? {}) as {
    full_name?: string
    name?: string
    username?: string
    avatar_url?: string
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: metadata.full_name ?? metadata.name ?? null,
      username: metadata.username ?? null,
      image: metadata.avatar_url ?? null,
    },
  }
}

export function clearAdminSessionCookieHeaders(response: Response) {
  response.headers.append("Set-Cookie", serializeAdminCookie("", 0))
}

export function buildAdminSessionCookie(accessToken: string, expiresIn?: number) {
  const maxAge = typeof expiresIn === "number" && expiresIn > 0 ? expiresIn : 60 * 60
  return serializeAdminCookie(accessToken, maxAge)
}
