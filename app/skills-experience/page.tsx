import type { Metadata } from "next"
import Link from "next/link"

import ExperienceDetail from "@/components/skills-experience/experience-detail"
import SidebarNavigation from "@/components/skills-experience/sidebar-navigation"
import SkillsGrid from "@/components/skills-experience/skills-grid"
import PageLayout from "@/components/layout/page-layout"
import PageHero from "@/components/sections/page-hero"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Skill {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  level: number
  category?: string | null
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

export const metadata: Metadata = {
  title: "Skills & Experience | Kejsan Coku",
  description:
    "Explore the marketing skills and hands-on experience that fuel content, growth, and community results across channels.",
  openGraph: {
    title: "Skills & Experience | Kejsan Coku",
    description:
      "Explore the marketing skills and hands-on experience that fuel content, growth, and community results across channels.",
    url: `${SITE_URL}/skills-experience`,
  },
}

async function loadSkills(): Promise<Skill[]> {
  const response = await fetch(`${SITE_URL}/api/skills`, {
    cache: "no-store",
  })

  if (!response.ok) {
    return []
  }

  return response.json()
}

async function loadExperiences(): Promise<Experience[]> {
  const response = await fetch(`${SITE_URL}/api/experiences`, {
    cache: "no-store",
  })

  if (!response.ok) {
    return []
  }

  return response.json()
}

function getExperienceSortValue(period?: string | null) {
  if (!period) return 0
  const match = period.match(/\d{4}/)
  return match ? Number.parseInt(match[0], 10) : 0
}

export default async function SkillsExperiencePage() {
  const [skills, experiences] = await Promise.all([loadSkills(), loadExperiences()])
  const sortedExperiences = [...experiences].sort(
    (a, b) => getExperienceSortValue(b.period) - getExperienceSortValue(a.period),
  )

  const navItems = [
    { id: "skill-list", label: "Skills", href: "#skill-list" },
    { id: "experience", label: "Experience", href: "#experience" },
    ...sortedExperiences.map((experience) => ({
      id: `experience-${experience.id}`,
      href: `#experience-${experience.id}`,
      label: experience.title || experience.company,
    })),
  ]

  return (
    <PageLayout>
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
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
              <Link href="#skill-list">Jump to skills</Link>
            </Button>
          </div>
        }
      >
        <div className="grid w-full gap-4 md:grid-cols-3">
          {["Content & Social", "Community", "Growth Experiments"].map((focus) => (
            <Badge
              key={focus}
              variant="outline"
              className="justify-center rounded-full border-white/15 bg-white/5 px-4 py-2 text-sm text-white"
            >
              {focus}
            </Badge>
          ))}
        </div>
      </PageHero>

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr,280px]">
          <div className="space-y-16">
            <section id="skill-list" className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">Skills</p>
                  <h2 className="text-3xl font-semibold">Toolkit & approaches</h2>
                  <p className="text-white/70">
                    Filter and sort the methods, platforms, and playbooks I lean on most.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-white/70">
                  <Badge className="bg-white/10 text-white">Icons indicate go-to tools</Badge>
                  <Badge variant="outline" className="border-white/10 text-white/80">
                    Level ranks hands-on depth
                  </Badge>
                </div>
              </div>

              <SkillsGrid skills={skills} />
            </section>

            <section id="experience" className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">Experience</p>
                  <h2 className="text-3xl font-semibold">Where the skills were honed</h2>
                  <p className="text-white/70">
                    Chronological highlights with the achievements and skills each role strengthened.
                  </p>
                </div>
                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <Link href="/#contact">Discuss a project</Link>
                </Button>
              </div>

              <div
                className={cn(
                  "space-y-4",
                  sortedExperiences.length === 0 && "rounded-2xl border border-white/20 bg-white/5 backdrop-blur p-6",
                )}
              >
                {sortedExperiences.length === 0 ? (
                  <div className="text-white/70">No experiences found yet. Please check back soon.</div>
                ) : (
                  sortedExperiences.map((experience) => (
                    <ExperienceDetail key={experience.id} experience={experience} />
                  ))
                )}
              </div>
            </section>
          </div>

          <SidebarNavigation items={navItems} />
        </div>
      </div>
    </PageLayout>
  )
}
