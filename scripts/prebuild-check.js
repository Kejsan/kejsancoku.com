// scripts/prebuild-check.js
// Skip running prisma migrate deploy during Netlify builds to avoid PgBouncer / pooler prepared statement conflicts.
const { execSync } = require("child_process")

if (process.env.NETLIFY) {
  console.log("Skipping prisma migrate deploy on Netlify build (NETLIFY=true)")
  process.exit(0)
}

try {
  execSync("pnpm exec prisma migrate deploy", { stdio: "inherit" })
} catch (error) {
  console.error("prisma migrate deploy failed. Ensure DATABASE_URL is correct and migrations are valid.")
  process.exit(error?.status ?? 1)
}
