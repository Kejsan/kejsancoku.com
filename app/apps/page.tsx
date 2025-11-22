"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

import PageHero from "@/components/sections/page-hero"
import PageLayout from "@/components/layout/page-layout"

interface WebApp {
  id: number
  name: string
  url: string
  description: string
}

export default function AppsPage() {
  const [apps, setApps] = useState<WebApp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/apps")
      .then((res) => res.json())
      .then((data) => {
        setApps(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch apps:", err)
        setLoading(false)
      })
  }, [])

  return (
    <PageLayout>
      <PageHero
        title="My Applications"
        description="A collection of tools and web apps I&apos;ve built."
      />

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-2xl border border-white/20 bg-white/5 p-6 shadow-sm animate-pulse backdrop-blur"
                >
                  <div className="mb-4 h-8 w-3/4 rounded bg-white/20" />
                  <div className="mb-2 h-4 w-full rounded bg-white/20" />
                  <div className="h-4 w-5/6 rounded bg-white/20" />
                </div>
              ))
            : apps.map((app) => (
                <article
                  key={app.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/20 bg-white/5 backdrop-blur p-6 shadow-sm transition-colors hover:border-[#fb6163]/50 hover:bg-white/10"
                >
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-white">{app.name}</h2>
                    <p className="text-sm text-white/70">{app.description}</p>
                  </div>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#fb6163] transition-colors hover:text-[#fb6163]/80"
                  >
                    View App
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              ))}
        </div>
      </section>
    </PageLayout>
  )
}
