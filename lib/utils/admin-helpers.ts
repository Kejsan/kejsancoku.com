import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a URL-friendly slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

/**
 * Parses a date string that might be coming from a form or URL.
 * Ensures it's a valid Date object or returns null.
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Helper to determine if a drawer should be open based on URL params.
 */
export function getDrawerState(
  searchParams: { [key: string]: string | string[] | undefined },
  paramName: string = "create"
): boolean {
  const param = searchParams[paramName]
  return param === "true"
}

/**
 * Helper to get the ID for editing from URL params.
 */
export function getEditId(
  searchParams: { [key: string]: string | string[] | undefined },
  paramName: string = "edit"
): number | null {
  const param = searchParams[paramName]
  if (typeof param === "string") {
    const id = parseInt(param, 10)
    return isNaN(id) ? null : id
  }
  return null
}
