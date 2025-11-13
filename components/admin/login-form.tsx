"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Loader2, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SUPABASE_CONFIG_ERROR_MESSAGE,
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"

const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

const USERNAME_OVERRIDES = Object.fromEntries(
  Object.entries({ kejsan: configuredAdminEmail ?? "" }).filter(([, email]) => email),
)

type UsernameLookupResult = {
  email: string | null
}

export function AdminLoginForm() {
  const router = useRouter()
  const supabaseConfigured = isSupabaseConfigured
  const supabase = useMemo(
    () => (supabaseConfigured ? getSupabaseBrowserClient() : null),
    [supabaseConfigured],
  )
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let isMounted = true

    void (async () => {
      const { data } = await supabase.auth.getSession()

      if (!isMounted || !data.session) {
        return
      }

      const response = await fetch("/api/admin/session").catch(() => undefined)

      if (!isMounted) {
        return
      }

      if (response?.ok) {
        router.replace("/admin")
        return
      }

      await supabase.auth.signOut().catch((error) => {
        console.error("Failed to clear stale Supabase session", error)
      })
    })()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  const resolveEmail = useCallback(
    async (value: string) => {
      if (!supabase) {
        throw new Error(SUPABASE_CONFIG_ERROR_MESSAGE)
      }

      const trimmed = value.trim()
      if (!trimmed) {
        return null
      }

      if (trimmed.includes("@")) {
        return trimmed
      }

      const normalized = trimmed.toLowerCase()

      if (normalized in USERNAME_OVERRIDES) {
        return USERNAME_OVERRIDES[normalized]
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", normalized)
        .maybeSingle()

      if (error) {
        console.error("Failed to look up username", error)
        throw new Error("We couldn&apos;t verify that username. Try your email instead.")
      }

      const record = data as UsernameLookupResult | null

      if (!record?.email) {
        return null
      }

      return record.email
    },
    [supabase],
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)

      if (!supabase) {
        setError(SUPABASE_CONFIG_ERROR_MESSAGE)
        return
      }

      if (!identifier.trim() || !password.trim()) {
        setError("Please enter both your email or username and your password.")
        return
      }

      setSubmitting(true)

      try {
        const email = await resolveEmail(identifier)

        if (!email) {
          setError("We couldn&apos;t find that account. Double-check your details and try again.")
          setSubmitting(false)
          return
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error || !data.session) {
          console.error("Supabase sign-in failed", error)
          setError(
            error?.message === "Invalid login credentials"
              ? "Those credentials didn&apos;t match. Please try again."
              : "We ran into a problem signing you in. Please try again.",
          )
          setSubmitting(false)
          return
        }

        const cookieResponse = await fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: data.session.access_token,
            expiresIn: data.session.expires_in,
          }),
        }).catch(() => undefined)

        if (!cookieResponse || !cookieResponse.ok) {
          setError(
            "Signed in with Supabase, but we couldn&apos;t create an admin session cookie. Please try again.",
          )
          await supabase.auth.signOut().catch((signOutError) => {
            console.error("Failed to clear Supabase session after cookie error", signOutError)
          })
          setSubmitting(false)
          return
        }

        router.replace("/admin")
      } catch (caught) {
        console.error("Failed to sign in", caught)
        if (caught instanceof Error) {
          setError(caught.message)
        } else {
          setError("We couldn&apos;t sign you in right now. Please try again.")
        }
      } finally {
        setSubmitting(false)
      }
    },
    [identifier, password, resolveEmail, router, supabase],
  )

  if (!supabase) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border bg-background/80 p-8 text-center shadow-sm backdrop-blur">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Supabase configuration required</h1>
          <p className="text-sm text-muted-foreground">{SUPABASE_CONFIG_ERROR_MESSAGE}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border bg-background/80 p-8 shadow-sm backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="text-sm text-muted-foreground">
          Use your Supabase credentials to access the admin dashboard.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or username</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="you@example.com or kejsan"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            disabled={submitting}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot it? Contact Kejsan.
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            required
          />
        </div>
        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden />
            <p className="text-sm" role="alert">
              {error}
            </p>
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" aria-hidden />
              Sign in
            </>
          )}
        </Button>
      </form>
      <Button
        variant="ghost"
        type="button"
        onClick={() => router.push("/")}
        disabled={submitting}
        className="inline-flex items-center gap-2 self-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Return to site
      </Button>
    </div>
  )
}
