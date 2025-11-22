"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink, ChevronUp, TrendingUp, Users, FileText, Globe, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import PageLayout from "@/components/layout/page-layout"
import PageHero from "@/components/sections/page-hero"
import PageCta from "@/components/sections/page-cta"
import { STATIC_SITE_SETTINGS } from "@/lib/static-site-settings"

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
  const [workSamples, setWorkSamples] = useState<WorkSample[]>([])
  const [isLoadingSamples, setIsLoadingSamples] = useState(true)
  const [samplesError, setSamplesError] = useState<string | null>(null)

  useEffect(() => {
    // Load anime.js dynamically
    const loadAnime = async () => {
      try {
        const animeModule = (await import("animejs")) as any
        const anime = animeModule.default ?? animeModule

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

  const emailHref = STATIC_SITE_SETTINGS.email
    ? `mailto:${STATIC_SITE_SETTINGS.email}`
    : null

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
    [],
  )

  const scrollButtonLabel = STATIC_SITE_SETTINGS.email
    ? `Scroll to top and contact ${STATIC_SITE_SETTINGS.email}`
    : "Scroll to top"

  return (
    <PageLayout>
      <PageHero
        className="work-header"
        title="Work Samples"
        description="A showcase of my digital marketing work across various companies and platforms. From social media growth to content creation, here&apos;s a comprehensive look at my professional contributions."
      >
        <div className="grid w-full grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            { label: "LinkedIn Growth", value: "19k" },
            { label: "Articles Written", value: "50+" },
            { label: "Platforms Managed", value: "6" },
            { label: "Companies", value: "4" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur p-4 shadow-sm">
              <div className="text-2xl font-semibold text-[#fb6163]">{stat.value}</div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl space-y-16">
          {isLoadingSamples ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : samplesError ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-400">
              {samplesError}
            </div>
          ) : workSamples.length === 0 ? (
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur p-6 text-center text-white/70">
              No work samples available at the moment. Please check back later.
            </div>
          ) : (
            workSamples.map((sample) => {
              const iconKey = typeof sample.icon === "string" ? sample.icon.toLowerCase() : undefined
              const IconComponent = iconKey ? iconMap[iconKey] ?? null : null
              const hasDetailedLinks = Boolean(
                sample.mainContent?.url ||
                  sample.socialChannels?.some((channel) => Boolean(channel.url)) ||
                  sample.writingSamples?.some((article) => Boolean(article.url)),
              )

              return (
                <Card
                  key={sample.id}
                  className="work-category border border-white/20 bg-white/5 backdrop-blur shadow-sm transition-colors hover:border-[#fb6163]/50 hover:bg-white/10"
                >
                  <CardContent className="space-y-8 p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                        {IconComponent ? <IconComponent className="h-8 w-8 text-[#fb6163]" /> : <Globe className="h-8 w-8 text-[#fb6163]" />}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-semibold text-white">{sample.title}</h2>
                          {sample.description ? (
                            <p className="text-lg text-white/80">{sample.description}</p>
                          ) : null}
                        </div>
                        {!!sample.stats?.length && (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {sample.stats?.map((stat, i) => (
                              <div key={i} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur p-4 text-left">
                                <div className="text-sm font-medium text-white/70">{stat.label}</div>
                                <div className="text-lg font-semibold text-white">{stat.value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {sample.mainContent?.url ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">Main Content Platform</h3>
                        <a
                          href={sample.mainContent.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[#fb6163]/40 bg-[#fb6163] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-[#fb6163]/50 hover:bg-[#fb6163]/90"
                        >
                          <Globe className="h-5 w-5" />
                          {sample.mainContent.title ?? sample.mainContent.url}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ) : null}

                    {!hasDetailedLinks && sample.url ? (
                      <div>
                        <a
                          href={sample.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[#fb6163]/40 bg-[#fb6163] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-[#fb6163]/50 hover:bg-[#fb6163]/90"
                        >
                          <Globe className="h-5 w-5" />
                          Visit Project
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ) : null}

                    {!!sample.socialChannels?.length ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                          {sample.socialHeading ?? "Managed Social Media Channels"}
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {sample.socialChannels?.map((channel, i) => (
                            <div key={i} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white">
                                  {channel.platform ?? channel.title}
                                </h4>
                                <a
                                  href={channel.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-[#fb6163] transition-colors hover:text-[#fb6163]/80"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                              {channel.description ? (
                                <p className="mb-3 text-sm text-white/70">{channel.description}</p>
                              ) : null}
                              <a
                                href={channel.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all text-sm font-medium text-[#fb6163] transition-colors hover:text-[#fb6163]/80"
                              >
                                {channel.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {!!sample.writingSamples?.length ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">Published Writing Samples</h3>
                        <div className="grid gap-3">
                          {sample.writingSamples?.map((article, i) => (
                            <a
                              key={i}
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between rounded-xl border border-white/20 bg-white/5 backdrop-blur p-4 transition-colors hover:border-[#fb6163]/40 hover:bg-white/10"
                            >
                              <span className="text-sm font-medium text-white transition-colors group-hover:text-[#fb6163]">
                                {article.title ?? article.url}
                              </span>
                              <ExternalLink className="h-4 w-4 text-white/60 transition-colors group-hover:text-[#fb6163]" />
                            </a>
                          ))}
                        </div>
                        {sample.writingSamplesNote ? (
                          <p className="text-sm text-white/70">{sample.writingSamplesNote}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {sample.additionalNote ? (
                      <div className="rounded-xl border border-[#fb6163]/40 bg-[#fb6163]/10 p-4">
                        <p className="text-sm text-white/80">{sample.additionalNote}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </section>

      <PageCta
        title="Interested in Working Together?"
        description="These samples represent just a portion of my work. I&apos;d love to discuss how I can help grow your digital presence."
        actions={
          <>
            {emailHref ? (
              <a href={emailHref}>
                <Button size="lg" className="bg-[#fb6163] hover:bg-[#fb6163]/90 text-white">Get In Touch</Button>
              </a>
            ) : (
              <Button size="lg" disabled className="bg-[#fb6163]/50 text-white">
                Email Unavailable
              </Button>
            )}
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                View Full Portfolio
              </Button>
            </Link>
          </>
        }
      />

      {showScrollTop ? (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full border border-[#fb6163]/40 bg-[#fb6163] p-3 text-white shadow-lg transition-transform hover:scale-105 hover:border-[#fb6163]/50 hover:bg-[#fb6163]/90"
          aria-label={scrollButtonLabel}
          title={scrollButtonLabel}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      ) : null}
    </PageLayout>
  )
}
