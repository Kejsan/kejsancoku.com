import type { Session } from "next-auth"

import { getAdminSession } from "./auth"

type SafeAdminSessionSuccess = {
  ok: true
  session: Session
  error?: undefined
}

type SafeAdminSessionFailure = {
  ok: false
  session: null
  error: unknown
}

export type SafeAdminSessionResult =
  | SafeAdminSessionSuccess
  | SafeAdminSessionFailure

function logSessionWarning(message: string, error?: unknown) {
  if (error !== undefined) {
    console.warn(`[safe-session] ${message}`, error)
  } else {
    console.warn(`[safe-session] ${message}`)
  }
}

export async function getSafeAdminSession(): Promise<SafeAdminSessionResult> {
  try {
    const session = await getAdminSession()

    if (!session) {
      const error = new Error("Admin session missing or unauthorized")
      logSessionWarning("Failed to acquire admin session.", error)
      return { ok: false, session: null, error }
    }

    return { ok: true, session }
  } catch (error) {
    logSessionWarning("Failed to acquire admin session.", error)
    return { ok: false, session: null, error }
  }
}
