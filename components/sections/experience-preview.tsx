"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface ExperienceSummary {
  id: string
  title: string
  company: string
  period: string | null
  location: string | null
  description: string | null
}

function truncate(text: string, maxLength = 180) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}

export default function ExperiencePreview() {
  const [experiences, setExperiences] = useState<ExperienceSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadExperiences() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/experiences/summary", {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Failed to load experiences: ${response.statusText}`)
        }

        const data: ExperienceSummary[] = await response.json()
        if (isMounted) {
          setExperiences(data)
        }
      } catch (err) {
        if (!isMounted || (err instanceof Error && err.name === "AbortError")) {
          return
        }
        console.error("Unable to load experience summary", err)
        setError("Unable to load experience highlights right now.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadExperiences()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const displayedExperiences = experiences.slice(0, 3)

  return (
    <section id="experience" className="py-16 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Experience</p>
            <h2 className="text-3xl font-semibold">Recent highlights</h2>
            <p className="text-white/70">
              A quick look at impactful roles across marketing, growth, and content.
            </p>
          </div>
          <Link
            href="/skills-experience"
            className="text-sm font-medium text-[#fb6163] underline-offset-4 hover:underline"
          >
            View all experiences
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 h-4 w-24 animate-pulse rounded bg-white/10" />
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-white">
            {error}
          </div>
        ) : displayedExperiences.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Experience highlights will appear here once they are published.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {displayedExperiences.map((experience) => (
              <Link
                key={experience.id}
                href={`/skills-experience#experience-${experience.id}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-sm transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                  {experience.period ? <span>{experience.period}</span> : null}
                  {experience.location ? <span>• {experience.location}</span> : null}
                </div>
                <h3 className="text-xl font-semibold group-hover:text-[#fb6163]">
                  {experience.title || experience.company}
                </h3>
                <p className="text-[#54a09b]">{experience.company}</p>
                {experience.description ? (
                  <p className="mt-3 text-white/70">{truncate(experience.description)}</p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#fb6163]">
                  View details <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
