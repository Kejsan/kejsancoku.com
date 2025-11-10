"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ExternalLink,
  ChevronUp,
  TrendingUp,
  Users,
  FileText,
  Globe,
  Loader2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import type { SiteSettings } from "@prisma/client"
import type { SiteSettingsResponse } from "@/types/site-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type WorkSampleStat = {
  label: string
  value: string
}

type WorkSampleLink = {
  title?: string
  platform?: string
  description?: string
  url: string
}

type WorkSample = {
  id: number | string
  title: string
  description?: string | null
  url?: string | null
  icon?: string | null
  stats?: WorkSampleStat[] | null
  mainContent?: WorkSampleLink | null
  socialChannels?: WorkSampleLink[] | null
  socialHeading?: string | null
  writingSamples?: WorkSampleLink[] | null
  writingSamplesNote?: string | null
  additionalNote?: string | null
}

export default function WorkSamples() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [workSamples, setWorkSamples] = useState<WorkSample[]>([])
  const [isLoadingSamples, setIsLoadingSamples] = useState(true)
  const [samplesError, setSamplesError] = useState<string | null>(null)

  useEffect(() => {
    // Load anime.js dynamically
    const loadAnime = async () => {
      try {
        const anime = (await import("animejs")).default as any

        anime({
          targets: ".work-header",
          translateY: [50, 0],
          opacity: [0, 1],
          duration: 800,
          easing: "easeOutExpo",
        })

        anime({
          targets: ".work-category",
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 600,
          delay: anime.stagger(150),
          easing: "easeOutExpo",
        })
      } catch (error) {
        console.log("Anime.js not available, using CSS animations as fallback")
        const elements = document.querySelectorAll(".work-header, .work-category")
        elements.forEach((el) => {
          ;(el as HTMLElement).style.opacity = "1"
        })
      }
    }

    loadAnime()

    // Scroll to top button visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    fetch("/api/footer")
      .then((res) => res.json())
      .then((payload: SiteSettingsResponse) => setSettings(payload.settings))
      .catch((error) => {
        console.error("Failed to load footer settings", error)
      })
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchWorkSamples = async () => {
      try {
        setIsLoadingSamples(true)
        const response = await fetch("/api/worksamples")
        if (!response.ok) {
          throw new Error("Failed to load work samples")
        }
        const data: WorkSample[] = await response.json()
        if (isMounted) {
          setWorkSamples(Array.isArray(data) ? data : [])
          setSamplesError(null)
        }
      } catch (error) {
        if (isMounted) {
          setSamplesError(error instanceof Error ? error.message : "Failed to load work samples")
          setWorkSamples([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingSamples(false)
        }
      }
    }

    fetchWorkSamples()

    return () => {
      isMounted = false
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const emailHref = settings?.email ? `mailto:${settings.email}` : null

  const iconMap = useMemo<Record<string, LucideIcon>>(
    () => ({
      trendingup: TrendingUp,
      trending_up: TrendingUp,
      trendingUp: TrendingUp,
      users: Users,
      people: Users,
      filetext: FileText,
      file_text: FileText,
      fileText: FileText,
      globe: Globe,
      world: Globe,
    }),
    []
  )

  const scrollButtonLabel = settings?.email
    ? `Scroll to top and contact ${settings.email}`
    : "Scroll to top"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-white font-bold text-xl">
              {settings?.brandName || "Kejsan"}
            </Link>
            <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Header */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center work-header">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Work Samples</h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              A showcase of my digital marketing work across various companies and platforms. From social media growth to content creation, here&apos;s a comprehensive look at my professional contributions.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#fb6163]">19k</div>
                <div className="text-white/60 text-sm">LinkedIn Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#fb6163]">50+</div>
                <div className="text-white/60 text-sm">Articles Written</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#fb6163]">6</div>
                <div className="text-white/60 text-sm">Platforms Managed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#fb6163]">4</div>
                <div className="text-white/60 text-sm">Companies</div>
              </div>
            </div>
          </div>
        </section>

        {/* Work Samples */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto space-y-16">
            {isLoadingSamples ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-[#fb6163]" />
              </div>
            ) : samplesError ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-100">
                {samplesError}
              </div>
            ) : workSamples.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
                No work samples available at the moment. Please check back later.
              </div>
            ) : (
              workSamples.map((sample) => {
                const iconKey = typeof sample.icon === "string" ? sample.icon.toLowerCase() : undefined
                const IconComponent = iconKey ? iconMap[iconKey] ?? null : null
                const hasDetailedLinks = Boolean(
                  sample.mainContent?.url ||
                    sample.socialChannels?.some((channel) => Boolean(channel.url)) ||
                    sample.writingSamples?.some((article) => Boolean(article.url))
                )

                return (
                  <Card
                    key={sample.id}
                    className="work-category bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                  >
                    <CardContent className="p-8">
                      {/* Header */}
                      <div className="flex items-start gap-6 mb-8">
                        <div className="p-4 bg-gradient-to-r from-[#54a09b]/20 to-[#fb6163]/20 rounded-xl border border-[#fb6163]/30">
                          {IconComponent ? (
                            <IconComponent className="h-8 w-8 text-[#fb6163]" />
                          ) : (
                            <Globe className="h-8 w-8 text-[#fb6163]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-white mb-3">{sample.title}</h2>
                          {sample.description && (
                            <p className="text-white/80 text-lg mb-4">{sample.description}</p>
                          )}
                          {!!sample.stats?.length && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              {sample.stats?.map((stat, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                  <div className="text-[#fb6163] font-semibold text-sm">{stat.label}</div>
                                  <div className="text-white font-medium">{stat.value}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Content Link */}
                      {sample.mainContent?.url && (
                        <div className="mb-8">
                          <h3 className="text-xl font-semibold text-white mb-4">Main Content Platform</h3>
                          <a
                            href={sample.mainContent.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#54a09b] to-[#fb6163] text-white px-6 py-3 rounded-lg hover:from-[#54a09b]/90 hover:to-[#fb6163]/90 transition-all duration-300"
                          >
                            <Globe className="w-5 h-5" />
                            {sample.mainContent.title ?? sample.mainContent.url}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {/* Default External Link */}
                      {!hasDetailedLinks && sample.url && (
                        <div className="mb-8">
                          <a
                            href={sample.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#54a09b] to-[#fb6163] text-white px-6 py-3 rounded-lg hover:from-[#54a09b]/90 hover:to-[#fb6163]/90 transition-all duration-300"
                          >
                            <Globe className="w-5 h-5" />
                            Visit Project
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {/* Social Channels */}
                      {!!sample.socialChannels?.length && (
                        <div className="mb-8">
                          <h3 className="text-xl font-semibold text-white mb-4">
                            {sample.socialHeading ?? "Managed Social Media Channels"}
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {sample.socialChannels?.map((channel, i) => (
                              <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-white">{channel.platform ?? channel.title}</h4>
                                  <a
                                    href={channel.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#fb6163] hover:text-[#fb6163]/80 transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                                {channel.description && (
                                  <p className="text-white/70 text-sm mb-3">{channel.description}</p>
                                )}
                                <a
                                  href={channel.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#54a09b] hover:text-[#54a09b]/80 text-sm break-all transition-colors"
                                >
                                  {channel.url}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Writing Samples */}
                      {!!sample.writingSamples?.length && (
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold text-white mb-4">Published Writing Samples</h3>
                          <div className="grid gap-3">
                            {sample.writingSamples?.map((article, i) => (
                              <a
                                key={i}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                              >
                                <span className="text-white group-hover:text-[#fb6163] transition-colors">
                                  {article.title ?? article.url}
                                </span>
                                <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-[#fb6163] transition-colors" />
                              </a>
                            ))}
                          </div>
                          {sample.writingSamplesNote && (
                            <p className="text-white/60 text-sm mt-4 italic">{sample.writingSamplesNote}</p>
                          )}
                        </div>
                      )}

                      {/* Additional Note */}
                      {sample.additionalNote && (
                        <div className="mt-6 p-4 bg-[#fb6163]/10 border border-[#fb6163]/20 rounded-lg">
                          <p className="text-white/80 italic">{sample.additionalNote}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </section>
        {/* Call to Action */}
        <section className="px-4 py-16 bg-gradient-to-r from-[#000080]/20 to-[#fb6163]/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Interested in Working Together?</h2>
            <p className="text-white/80 text-lg mb-8">
              These samples represent just a portion of my work. I&apos;d love to discuss how I can help grow your digital presence.
            </p>
            <div className="flex justify-center gap-6">
              {emailHref ? (
                <a href={emailHref}>
                  <Button size="lg" className="bg-[#fb6163] hover:bg-[#fb6163]/90 text-white">
                    Get In Touch
                  </Button>
                </a>
              ) : (
                <Button size="lg" className="bg-[#fb6163]/50 text-white/70 cursor-not-allowed" disabled>
                  Email Unavailable
                </Button>
              )}
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  View Full Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#fb6163] hover:bg-[#fb6163]/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label={scrollButtonLabel}
          title={scrollButtonLabel}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
