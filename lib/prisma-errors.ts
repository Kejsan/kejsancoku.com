import type { Prisma } from "@prisma/client"

function extractMessageFromObject(error: Record<string, unknown>): string | null {
  if (typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message
  }

  if (typeof error.error === "string" && error.error.trim().length > 0) {
    return error.error
  }

  if (typeof error.cause === "string" && error.cause.trim().length > 0) {
    return error.cause
  }

  if (
    error.meta &&
    typeof error.meta === "object" &&
    error.meta !== null &&
    typeof (error.meta as { cause?: unknown }).cause === "string"
  ) {
    return (error.meta as { cause?: string }).cause ?? null
  }

  return null
}

function withErrorCode(message: string, error: Record<string, unknown>): string {
  const code = typeof error.code === "string" ? error.code : null
  if (!code) {
    return message
  }

  if (message.includes(code)) {
    return message
  }

  return `[${code}] ${message}`
}

export function getPrismaErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return withErrorCode(error.message, error as unknown as Record<string, unknown>)
  }

  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>

    const message = extractMessageFromObject(record)
    if (message) {
      return withErrorCode(message, record)
    }

    if (typeof record.toString === "function") {
      const text = String(record)
      if (text && text !== "[object Object]") {
        return text
      }
    }
  }

  return fallback
}

export type PrismaError =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientInitializationError
  | Prisma.PrismaClientRustPanicError
  | Prisma.PrismaClientValidationError
