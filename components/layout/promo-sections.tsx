import Link from "next/link"

import type { ActivePromoSection } from "@/lib/promos"
import { cn } from "@/lib/utils"

function PromoLink({ promo }: { promo: ActivePromoSection }) {
  if (!promo.linkHref || !promo.linkLabel) {
    return null
  }

  const isExternal = /^https?:\/\//.test(promo.linkHref)

  return (
    <Link
      href={promo.linkHref}
      className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
    >
      {promo.linkLabel}
    </Link>
  )
}

export function PromoBar({
  promo,
  position,
}: {
  promo: ActivePromoSection
  position: "top" | "bottom"
}) {
  const containerStyles =
    position === "top"
      ? "bg-[#fb6163] text-white"
      : "bg-slate-900/80 text-slate-50 border-t border-white/10"

  return (
    <div className={cn("w-full px-4 py-3 text-sm", containerStyles)}>
      <div className="mx-auto flex max-w-5xl flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 sm:text-left">
          {promo.title ? (
            <p className="text-base font-semibold leading-tight sm:text-lg">
              {promo.title}
            </p>
          ) : null}
          {promo.description ? (
            <p className="text-xs font-medium text-white/80 sm:text-sm">
              {promo.description}
            </p>
          ) : null}
        </div>
        <div className="flex justify-center sm:justify-end">
          <PromoLink promo={promo} />
        </div>
      </div>
    </div>
  )
}

export function PromoCardGrid({ promos }: { promos: ActivePromoSection[] }) {
  if (promos.length === 0) {
    return null
  }

  return (
    <section className="border-t border-white/10 bg-slate-900/70 px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#54a09b]/70">Featured</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Discover more from Kejsan</h2>
          <p className="mt-2 text-sm text-slate-300">
            Curated promos, partnerships, and offers worth exploring before you leave.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => {
            const hasLink = Boolean(promo.linkHref && promo.linkLabel)
            const isExternal = hasLink && /^https?:\/\//.test(promo.linkHref ?? "")

            const cardContent = (
              <article className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#54a09b]/60">
                <div className="space-y-3 text-left">
                  {promo.title ? (
                    <h3 className="text-xl font-semibold text-white">{promo.title}</h3>
                  ) : null}
                  {promo.description ? (
                    <p className="text-sm text-slate-300">{promo.description}</p>
                  ) : null}
                </div>

                {hasLink ? (
                  <div className="mt-6 flex items-center justify-between text-sm text-[#54a09b]">
                    <span className="font-semibold">{promo.linkLabel}</span>
                    <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                  </div>
                ) : null}
              </article>
            )

            return hasLink ? (
              <Link
                key={promo.id}
                href={promo.linkHref ?? "#"}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                className="block h-full"
              >
                {cardContent}
              </Link>
            ) : (
              <div key={promo.id} className="h-full">
                {cardContent}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
