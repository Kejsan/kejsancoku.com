#!/usr/bin/env node

if (!process.env.DATABASE_URL) {
  const message =
    '[dev] Warning: DATABASE_URL is not set. Prisma-backed features are disabled; set DATABASE_URL to enable database access.'
  console.warn(message)
}
