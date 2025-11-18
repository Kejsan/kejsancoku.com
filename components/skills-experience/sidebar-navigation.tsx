"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Navigation } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SidebarNavigationProps {
  items: { id: string; label: string; href: string }[]
}

export default function SidebarNavigation({ items }: SidebarNavigationProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "")

  const sanitizedItems = useMemo(() => {
    const seen = new Set<string>()
    return items.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return Boolean(item.id && item.href)
    })
  }, [items])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.2, 0.5] },
    )

    const elements = sanitizedItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is Element => Boolean(el))

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [sanitizedItems])

  if (sanitizedItems.length === 0) return null

  return (
    <aside className="sticky top-28 self-start">
      <Card className="border-white/10 bg-white/5 p-4 text-white">
        <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-white/60">
          <Navigation className="h-4 w-4" />
          In this page
        </div>
        <nav className="space-y-1">
          {sanitizedItems.map((item) => (
            <Link key={item.id} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                  activeId === item.id
                    ? "bg-[#fb6163] text-white shadow-lg"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="line-clamp-1 font-medium">{item.label}</span>
                <ChevronRight className={cn("h-4 w-4", activeId === item.id ? "opacity-100" : "opacity-60")} />
              </div>
            </Link>
          ))}
        </nav>
      </Card>
    </aside>
  )
}
