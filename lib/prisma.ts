import type { PrismaClient } from "@prisma/client"

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient | null }

const globalForPrisma = globalThis as GlobalWithPrisma

function createPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[prisma] DATABASE_URL is not configured. Prisma-backed features are disabled.",
    )
    return null
  }

  try {
    const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client")
    return new PrismaClient()
  } catch (error) {
    const isModuleNotFound =
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "MODULE_NOT_FOUND"

    if (isModuleNotFound) {
      console.error(
        "[prisma] Prisma Client has not been generated. Run `prisma generate` during your build step.",
        error,
      )
    } else {
      console.error("[prisma] Failed to initialise Prisma Client.", error)
    }

    return null
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (prisma && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export default prisma
