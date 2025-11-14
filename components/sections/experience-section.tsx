"use client"

import { forwardRef, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Experience } from "@/types/experience"

const ExperienceSection = forwardRef<HTMLDivElement>(function ExperienceSection(_, ref) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null)
  const [showAllExperiences, setShowAllExperiences] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadExperiences() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/experiences", { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load experiences: ${response.statusText}`)
        }

        const data: Experience[] = await response.json()
        if (isMounted) {
          setExperiences(data)
        }
      } catch (err) {
        if (!isMounted) return
        if (err instanceof Error && err.name === "AbortError") {
          return
        }
        console.error("Unable to load experiences", err)
        setError("Unable to load experiences right now. Please try again later.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadExperiences()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const selectedExperience = useMemo(
    () => experiences.find((exp) => exp.id === selectedExperienceId) ?? null,
    [experiences, selectedExperienceId],
  )

  const displayedExperiences = showAllExperiences ? experiences : experiences.slice(0, 3)
  const hasMoreExperiences = experiences.length > 3

  return (
    <>
      <section id="experience" ref={ref} className="experience-section py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Professional Experience</h2>
          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center text-white/60">Loading experiences...</div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : displayedExperiences.length > 0 ? (
              displayedExperiences.map((exp) => (
                <Card
                  key={exp.id}
                  className="experience-card bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedExperienceId(exp.id)}
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#fb6163] transition-colors">
                          {exp.title ?? exp.company}
                        </h3>
                        <p className="text-[#54a09b] text-lg">{exp.company}</p>
                        {exp.careerProgression && (
                          <div className="mt-2 space-y-1">
                            {exp.careerProgression.map((role, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    role.type === "promotion"
                                      ? "bg-[#fb6163]"
                                      : role.type === "concurrent"
                                        ? "bg-[#54a09b]"
                                        : "bg-white/40"
                                  }`}
                                ></div>
                                <span className="text-white/70 text-sm">
                                  {role.title} ({role.period})
                                  {role.type === "promotion" && <span className="text-[#fb6163] ml-1">↗ Promoted</span>}
                                  {role.type === "concurrent" && (
                                    <span className="text-[#54a09b] ml-1">• Concurrent Role</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {exp.period && <p className="text-white/80">{exp.period}</p>}
                        {exp.location && <p className="text-white/60">{exp.location}</p>}
                      </div>
                    </div>
                    {exp.description && <p className="text-white/80 mb-4">{exp.description}</p>}
                    <div className="space-y-2 mb-4">
                      {(exp.achievements?.slice(0, 2) ?? []).map((achievement, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-[#fb6163] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-white/70">{achievement}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#fb6163] text-sm font-medium">Click to view full details →</span>
                      <div className="flex gap-2">
                        {(exp.skills?.slice(0, 3) ?? []).map((skill, i) => (
                          <span key={i} className="text-xs bg-[#fb6163]/20 text-[#fb6163] px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-white/60">No experiences found.</div>
            )}
          </div>

          {!isLoading && !error && hasMoreExperiences && !showAllExperiences && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setShowAllExperiences(true)}
                className="bg-gradient-to-r from-[#54a09b] to-[#fb6163] hover:from-[#54a09b]/90 hover:to-[#fb6163]/90 text-white px-8 py-3"
              >
                See More Experiences ({experiences.length - 3} more)
              </Button>
            </div>
          )}
        </div>
      </section>

      {selectedExperience && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedExperience.title ?? selectedExperience.company}
                  </h2>
                  <p className="text-[#54a09b] text-xl mb-1">{selectedExperience.company}</p>
                  <p className="text-white/80">
                    {[selectedExperience.period, selectedExperience.location]
                      .filter((value): value is string => Boolean(value))
                      .join(" • ")}
                  </p>
                  {selectedExperience.previousRole && (
                    <div className="mt-3 p-3 bg-[#fb6163]/10 border border-[#fb6163]/20 rounded-lg">
                      <p className="text-[#fb6163] text-sm font-medium">Career Progression</p>
                      <p className="text-white/80 text-sm">
                        {selectedExperience.previousRole.title} ({selectedExperience.previousRole.period})
                      </p>
                      <p className="text-white/60 text-xs">{selectedExperience.previousRole.note}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => setSelectedExperienceId(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                <p className="text-white/80 leading-relaxed">
                  {selectedExperience.fullDescription ?? selectedExperience.description ?? ""}
                </p>
              </div>

              {selectedExperience.careerProgression ? (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Career Progression & Responsibilities</h3>
                  <div className="space-y-6">
                    {selectedExperience.careerProgression.map((role, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          role.type === "promotion"
                            ? "bg-[#fb6163]/10 border-[#fb6163]/20"
                            : role.type === "concurrent"
                              ? "bg-[#54a09b]/10 border-[#54a09b]/20"
                              : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              role.type === "promotion"
                                ? "bg-[#fb6163]"
                                : role.type === "concurrent"
                                  ? "bg-[#54a09b]"
                                  : "bg-white/40"
                            }`}
                          ></div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{role.title}</h4>
                            <p className="text-white/70 text-sm">{role.period}</p>
                            {role.type === "promotion" && (
                              <span className="text-[#fb6163] text-xs font-medium">↗ Promotion</span>
                            )}
                            {role.type === "concurrent" && (
                              <span className="text-[#54a09b] text-xs font-medium">• Concurrent Role</span>
                            )}
                          </div>
                        </div>
                        {role.description && <p className="text-white/80 mb-3">{role.description}</p>}
                        <div className="space-y-2">
                          {(role.responsibilities ?? []).map((responsibility, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-white/70 text-sm leading-relaxed">{responsibility}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Key Responsibilities & Impact</h3>
                  <div className="space-y-3">
                    {(selectedExperience.responsibilities ?? []).map((responsibility, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#fb6163] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-white/70 leading-relaxed">{responsibility}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedExperience.skills ?? []).map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gradient-to-r from-[#54a09b]/20 to-[#fb6163]/20 border border-[#54a09b]/30 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

export default ExperienceSection
