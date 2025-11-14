import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ToolSummary = {
  id: number | string
  name: string
  url: string
  description?: string | null
}

type ToolCardProps = {
  tool: ToolSummary
  className?: string
  actions?: ReactNode
  linkLabel?: string
  showVisitLink?: boolean
}

export function ToolCard({
  tool,
  className,
  actions,
  linkLabel = "Visit tool",
  showVisitLink = true,
}: ToolCardProps) {
  const hostname = getHostname(tool.url)

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-white shadow-xl transition hover:-translate-y-1 hover:border-[#54a09b]/60 hover:shadow-2xl",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-white/10 before:opacity-0 before:transition before:duration-300 before:ease-out",
        "hover:before:opacity-100",
        className,
      )}
    >
      <div>
        <h3 className="text-2xl font-semibold leading-tight tracking-tight">{tool.name}</h3>
        {tool.description ? (
          <p className="mt-3 text-sm text-white/70">
            {tool.description}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
        {showVisitLink ? (
          <div className="flex flex-col">
            <Link
              href={tool.url}
              className="inline-flex items-center gap-2 font-semibold text-[#54a09b] transition hover:text-[#54a09b]/90"
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            {hostname ? (
              <span className="mt-1 text-xs text-white/50">{hostname}</span>
            ) : null}
          </div>
        ) : (
          <span className="text-white/70">&nbsp;</span>
        )}

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

type ToolCardSkeletonProps = {
  className?: string
}

export function ToolCardSkeleton({ className }: ToolCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-xl",
        "animate-pulse",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="h-6 w-3/4 rounded bg-white/20" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
      </div>
      <div className="mt-8 h-4 w-32 rounded bg-white/10" />
    </div>
  )
}

function getHostname(url: string): string | null {
  try {
    const { hostname } = new URL(url)
    return hostname.replace(/^www\./, "")
  } catch (error) {
    return null
  }
}
