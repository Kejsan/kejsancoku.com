import Link from "next/link"

import PageHero from "@/components/sections/page-hero"
import { Button } from "@/components/ui/button"

interface Skill {
  name: string
  slug: string
  frequency: number
}

interface Experience {
  id: string
  title: string
  company: string
  period: string | null
  location: string | null
  description: string | null
  achievements?: string[]
  skills?: string[]
}

async function loadSkills(): Promise<Skill[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/skills`, {
    cache: "no-store",
  })
  if (!response.ok) {
    return []
  }
  return response.json()
}

async function loadExperiences(): Promise<Experience[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/experiences`, {
    cache: "no-store",
  })
  if (!response.ok) {
    return []
  }
  return response.json()
}

export default async function SkillsExperiencePage() {
  const [skills, experiences] = await Promise.all([loadSkills(), loadExperiences()])

  return (
    <main className="bg-gradient-to-b from-slate-950 via-[#040720] to-slate-950 text-white">
      <PageHero
        title="Skills & Experience"
        description="Browse the expertise I bring to every engagement and the roles where those skills have driven measurable growth."
        align="center"
        eyebrow="Capabilities"
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-[#fb6163] hover:bg-[#fb6163]/90">
              <Link href="#experience">View experience highlights</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="#skill-list">Jump to skills</Link>
            </Button>
          </div>
        }
      />

      <section id="skill-list" className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Skills</p>
              <h2 className="text-3xl font-semibold">Toolkit</h2>
              <p className="text-white/70">What I use to build momentum across channels.</p>
            </div>
            <Link
              href="#experience"
              className="text-sm font-medium text-[#fb6163] underline-offset-4 hover:underline"
            >
              Skip to experience
            </Link>
          </div>
          {skills.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Skills data is loading. Please refresh if it does not appear.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {skills.map((skill) => (
                <div
                  key={skill.slug}
                  id={`skill-${skill.slug}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                    <span className="text-sm text-white/60">{skill.frequency}+ mentions</span>
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    Applied across campaigns, launches, and growth experiments.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="experience" className="px-4 pb-20">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Experience</p>
              <h2 className="text-3xl font-semibold">Where the skills were honed</h2>
              <p className="text-white/70">
                Selected roles that show how strategy, content, and growth experiments come together.
              </p>
            </div>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/#contact">Discuss a project</Link>
            </Button>
          </div>

          {experiences.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No experiences found yet. Please check back soon.
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((experience) => (
                <div
                  key={experience.id}
                  id={`experience-${experience.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{experience.title || experience.company}</h3>
                      <p className="text-[#54a09b] text-lg">{experience.company}</p>
                    </div>
                    <div className="text-sm text-white/60">
                      {[experience.period, experience.location].filter(Boolean).join(" • ")}
                    </div>
                  </div>
                  {experience.description ? (
                    <p className="mt-3 text-white/70">{experience.description}</p>
                  ) : null}
                  {experience.achievements?.length ? (
                    <ul className="mt-4 space-y-2 text-white/80">
                      {experience.achievements.slice(0, 3).map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#fb6163]" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {experience.skills?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {experience.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
