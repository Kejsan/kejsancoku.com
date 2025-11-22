"use client"

import { useMemo, useState } from "react"
import { Filter, Search, SlidersHorizontal, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

const SORT_OPTIONS = [
  { value: "level-desc", label: "Proficiency (high to low)" },
  { value: "level-asc", label: "Proficiency (low to high)" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
]

interface SkillsGridProps {
  skills: Skill[]
}

export default function SkillsGrid({ skills }: SkillsGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0]?.value ?? "level-desc")

  const categories = useMemo(() => {
    const unique = new Set<string>()
    skills.forEach((skill) => {
      if (skill.category) unique.add(skill.category)
    })
    return Array.from(unique)
  }, [skills])

  const filteredSkills = useMemo(() => {
    return [...skills]
      .filter((skill) => {
        const matchesCategory = activeCategory === "all" || skill.category === activeCategory
        const matchesSearch =
          search.trim().length === 0 ||
          skill.name.toLowerCase().includes(search.toLowerCase()) ||
          (skill.description ?? "").toLowerCase().includes(search.toLowerCase())

        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sort === "level-asc") return a.level - b.level
        if (sort === "name-asc") return a.name.localeCompare(b.name)
        if (sort === "name-desc") return b.name.localeCompare(a.name)
        return b.level - a.level
      })
  }, [skills, activeCategory, search, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
            <Search className="h-4 w-4 text-white/60" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search skills or descriptions"
              className="border-0 bg-transparent px-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-white/60" />
            <Button
              size="sm"
              variant={activeCategory === "all" ? "default" : "outline"}
              className={cn(
                "rounded-full border-white/20 bg-white/10 text-xs text-white hover:bg-white/20",
                activeCategory === "all" && "bg-[#fb6163] hover:bg-[#fb6163]/90",
              )}
              onClick={() => setActiveCategory("all")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={activeCategory === category ? "default" : "outline"}
                className={cn(
                  "rounded-full border-white/20 bg-white/10 text-xs text-white hover:bg-white/20",
                  activeCategory === category && "bg-[#fb6163] hover:bg-[#fb6163]/90",
                )}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/70">
          <SlidersHorizontal className="h-4 w-4" />
          <label className="text-xs uppercase tracking-[0.2em]">Sort</label>
          <select
            className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          No skills match this filter yet. Try clearing the search or choosing another category.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => (
            <Card
              key={skill.slug}
              id={`skill-${skill.slug}`}
              className="border-white/10 bg-white/5 text-white"
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg">
                      {skill.icon || <Sparkles className="h-5 w-5" />}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">{skill.name}</h3>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-xs text-white/80">
                        {skill.category || "General"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right text-xs uppercase tracking-[0.2em] text-white/60">
                    <span>Level</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-semibold text-white">
                      {skill.level}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-white/70">
                  {skill.description || "Applied across campaigns, launches, and growth experiments."}
                </p>

                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#fb6163] to-[#000080]"
                    style={{ width: `${Math.min(skill.level * 10, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
