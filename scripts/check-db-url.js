#!/usr/bin/env node

const warnings = []

if (!process.env.DATABASE_URL) {
  warnings.push(
    '[dev] Warning: DATABASE_URL is not set. Prisma-backed features are disabled; set DATABASE_URL to enable database access.',
  )
}

if (!process.env.DIRECT_URL) {
  warnings.push(
    '[dev] Warning: DIRECT_URL is not set. Prisma migrations may fail against pooled connections; set DIRECT_URL to the direct connection string.',
  )
}

for (const warning of warnings) {
  console.warn(warning)
}
