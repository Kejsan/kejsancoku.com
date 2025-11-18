"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

interface Skill {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  level: number
  category?: string | null
}

export default function InfiniteSkillsMarquee() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadSkills() {
      try {
        setError(null)
        const response = await fetch("/api/skills", { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load skills: ${response.statusText}`)
        }

        const data: Skill[] = await response.json()
        if (isMounted) {
          setSkills(data)
        }
      } catch (err) {
        if (!isMounted || (err instanceof Error && err.name === "AbortError")) {
          return
        }
        console.error("Unable to load skills", err)
        setError("Skills are unavailable right now. Please try again soon.")
      }
    }

    void loadSkills()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const marqueeSkills = useMemo(() => {
    if (!skills.length) return []
    return [...skills, ...skills]
  }, [skills])

  const content = error ? (
    <p className="text-center text-sm text-white/70">{error}</p>
  ) : !skills.length ? (
    <p className="text-center text-sm text-white/70">Loading featured skills...</p>
  ) : (
    <div
      className={`skills-marquee-track ${isPaused ? "paused" : ""}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {marqueeSkills.map((skill, index) => (
        <Link
          key={`${skill.slug}-${index}`}
          href={`/skills-experience#skill-${skill.slug}`}
          className="group mr-4 inline-flex min-w-[14rem] items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white shadow-sm backdrop-blur hover:border-white/30 hover:bg-white/10"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg">
            {skill.icon || "★"}
          </span>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-medium text-[#fb6163]">{skill.name}</span>
            <span className="text-xs text-white/70">
              Level {skill.level} · {skill.category || "General"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )

  return (
    <section id="skills" className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#000080]/60 via-transparent to-[#fb6163]/40" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Skills</p>
            <h2 className="text-3xl font-semibold">Always-on expertise</h2>
          </div>
          <Link
            href="/skills-experience"
            className="text-sm font-medium text-[#fb6163] underline-offset-4 hover:underline"
          >
            Explore all skills & experience
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
          {content}
        </div>
      </div>
    </section>
  )
}
