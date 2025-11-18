"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { WorkSample } from "@prisma/client"

import { Button } from "@/components/ui/button"

export default function WorkSamplesPreview() {
  const [samples, setSamples] = useState<WorkSample[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadSamples() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/worksamples", { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load work samples: ${response.statusText}`)
        }
        const data: WorkSample[] = await response.json()
        if (isMounted) {
          setSamples(data)
        }
      } catch (err) {
        if (!isMounted || (err instanceof Error && err.name === "AbortError")) {
          return
        }
        console.error("Unable to load work samples", err)
        setError("Unable to load work samples right now.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSamples()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const displayedSamples = samples.slice(0, 3)

  return (
    <section id="work-samples" className="py-16 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Work Samples</p>
            <h2 className="text-3xl font-semibold text-white">Proof in the work</h2>
            <p className="text-white/70">A preview of recent deliverables across content, growth, and tooling.</p>
          </div>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/work-samples">View all samples</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 h-4 w-1/3 animate-pulse rounded bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-white">{error}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {displayedSamples.map((sample) => (
              <Link
                key={sample.id}
                href={sample.url || "/work-samples"}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 text-white shadow-sm transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="text-sm uppercase tracking-wide text-[#fb6163]">{sample.title}</div>
                {sample.description ? (
                  <p className="mt-2 line-clamp-3 text-white/70">{sample.description}</p>
                ) : (
                  <p className="mt-2 text-white/60">View the deliverable</p>
                )}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#fb6163]">
                  View sample <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
