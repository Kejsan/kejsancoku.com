import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

let prismaClient: PrismaClient | null = null

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not configured. Prisma client will not be initialised."
  )
} else {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient()

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient
  }
}

export const prisma = prismaClient

export default prisma
