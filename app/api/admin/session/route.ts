import { NextResponse } from "next/server"

import {
  adminEmails,
  buildAdminSessionCookie,
  clearAdminSessionCookieHeaders,
  getAdminSession,
} from "@/lib/auth"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: SUPABASE_CONFIG_ERROR_MESSAGE },
      { status: 503 },
    )
  }

  const { accessToken, expiresIn } = (await request.json().catch(() => ({}))) as {
    accessToken?: string
    expiresIn?: number
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user || !data.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = data.user.email.toLowerCase()
  if (!adminEmails().includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.headers.append("Set-Cookie", buildAdminSessionCookie(accessToken, expiresIn))
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  clearAdminSessionCookieHeaders(response)
  return response
}

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: SUPABASE_CONFIG_ERROR_MESSAGE },
      { status: 503 },
    )
  }

  const session = await getAdminSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
