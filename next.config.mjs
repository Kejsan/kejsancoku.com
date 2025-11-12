const {
  NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(",")?.[0],
} = process.env

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_ADMIN_EMAIL: NEXT_PUBLIC_ADMIN_EMAIL ?? "",
  },
}

export default nextConfig
