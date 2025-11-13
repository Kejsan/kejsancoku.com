import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ""
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  ""

export const SUPABASE_CONFIG_ERROR_MESSAGE =
  "Supabase environment variables are not configured. Set NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY."

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let browserClient: SupabaseClient | null = null

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_CONFIG_ERROR_MESSAGE)
  }
}

export function getSupabaseBrowserClient() {
  ensureSupabaseConfigured()

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  return browserClient
}

export function createSupabaseServerClient() {
  ensureSupabaseConfigured()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export type BrowserSupabaseClient = ReturnType<typeof getSupabaseBrowserClient>
