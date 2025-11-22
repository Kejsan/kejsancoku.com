import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageHeroProps {
  title: ReactNode
  description?: ReactNode
  align?: "left" | "center"
  eyebrow?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export default function PageHero({
  title,
  description,
  align = "center",
  eyebrow,
  actions,
  children,
  className,
}: PageHeroProps) {
  const alignmentStyles =
    align === "center"
      ? "items-center text-center"
      : "items-start text-left"

  return (
    <section className={cn("px-4 py-16 sm:py-24", className)}>
      <div
        className={cn(
          "mx-auto flex max-w-4xl flex-col gap-6",
          alignmentStyles,
        )}
      >
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wide text-[#fb6163]">{eyebrow}</p>
        )}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">{title}</h1>
          {description ? <p className="text-lg text-white/80">{description}</p> : null}
        </div>
        {actions}
        {children}
      </div>
    </section>
  )
}
