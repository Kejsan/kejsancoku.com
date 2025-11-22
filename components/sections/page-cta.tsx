import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageCtaProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: "left" | "center"
  className?: string
}

export default function PageCta({
  title,
  description,
  actions,
  align = "center",
  className,
}: PageCtaProps) {
  const alignmentStyles =
    align === "center"
      ? "items-center text-center"
      : "items-start text-left"

  return (
    <section className={cn("px-4 py-16", className)}>
      <div
        className={cn(
          "mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur p-8 shadow-sm",
          alignmentStyles,
        )}
      >
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">{title}</h2>
          {description ? <p className="text-lg text-white/80">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-4">{actions}</div> : null}
      </div>
    </section>
  )
}
