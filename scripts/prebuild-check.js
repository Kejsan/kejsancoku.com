// scripts/prebuild-check.js
// Skip running prisma migrate deploy during Netlify builds to avoid PgBouncer / pooler prepared statement conflicts.
const { execSync } = require("child_process")

// Check removed: We need to run migrations on Netlify to ensure DB schema is up to date.
// Ensure DIRECT_URL is set in environment variables for proper migration with Supabase.
// if (process.env.NETLIFY) { ... }

try {
  execSync("pnpm exec prisma migrate deploy", { stdio: "inherit" })
} catch (error) {
  console.error("prisma migrate deploy failed. Ensure DATABASE_URL is correct and migrations are valid.")
  process.exit(error?.status ?? 1)
}
