import { NextResponse } from "next/server"

import {
  adminEmails,
  buildAdminSessionCookie,
  buildAdminRefreshCookie,
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

  const { accessToken, refreshToken, expiresIn } = (await request.json().catch(() => ({}))) as {
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 400 })
  }

  try {
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
    
    // Also store refresh token for token refresh capability
    if (refreshToken) {
      response.headers.append("Set-Cookie", buildAdminRefreshCookie(refreshToken))
    }
    
    return response
  } catch (error) {
    console.error("[session-api] POST error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Failed to verify credentials" },
      { status: 500 }
    )
  }
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

  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[session-api] GET error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Failed to validate session" },
      { status: 401 }
    )
  }
}
