"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ExternalLink, ChevronUp, TrendingUp, Users, FileText, Globe } from "lucide-react"
import Link from "next/link"
import type { SiteSettings } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function WorkSamples() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

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
      .then((data: SiteSettings | null) => setSettings(data))
      .catch((error) => {
        console.error("Failed to load footer settings", error)
      })
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const workSamples = [
    {
      id: "cardo-ai",
      title: "Cardo AI",
      description: "AI-powered financial services platform where I managed social media growth and content strategy",
      icon: <TrendingUp className="w-8 h-8 text-[#fb6163]" />,
      stats: [
        { label: "LinkedIn Growth", value: "2k → 19k followers" },
        { label: "Content Pieces", value: "50+ articles" },
        { label: "Platforms Managed", value: "LinkedIn, Instagram" },
      ],
      socialChannels: [
        {
          platform: "LinkedIn",
          description: "Grew from 2k to 19k followers through strategic content and engagement",
          url: "https://www.linkedin.com/company/cardoai/posts/",
        },
        {
          platform: "Instagram",
          description: "Showcased employees, office life, and company values",
          url: "https://www.instagram.com/cardoai_/",
        },
      ],
      writingSamples: [
        {
          title: "How AI & LLMs are Transforming the Financial Services Industry",
          url: "https://www.linkedin.com/pulse/how-ai-llms-transforming-financial-services-industry-asset-based-0lpzf/",
        },
        {
          title: "Ethical & Regulatory Insights leveraging Large Language Models",
          url: "https://www.linkedin.com/pulse/ethical-regulatory-insights-leveraging-large-language-models-financial-xdojf/",
        },
        {
          title: "Exploring Fine-Tuning LLMs for Enhanced Performance",
          url: "https://www.linkedin.com/pulse/exploring-fine-tuning-llms-enhanced-performance-abf-future-use-jq3df/",
        },
        {
          title: "Unlock Opportunities & Unique Insights in US Lending & Private Debt",
          url: "https://www.linkedin.com/pulse/unlock-opportunities-unique-insights-us-lending-private-debt-landscape-suanf/",
        },
        {
          title: "Cardo AI Contributes to MSCA Industrial Doctoral Network on Digital Finance",
          url: "https://cardoai.com/cardo-ai-contributes-to-msca-industrial-doctoral-network-on-digital-finance/",
        },
        {
          title: "Cardo AI Achieves SOC2 Type 2 Certification",
          url: "https://cardoai.com/cardo-ai-achieves-soc2-type-2-certification/",
        },
      ],
    },
    {
      id: "ipervox",
      title: "Ipervox",
      description: "Voice technology platform enabling voice applications for Amazon Alexa and Google Assistant",
      icon: <Users className="w-8 h-8 text-[#fb6163]" />,
      stats: [
        { label: "Content Platform", value: "Medium Blog" },
        { label: "Social Channels", value: "3 platforms" },
        { label: "Content Focus", value: "Voice Technology" },
      ],
      mainContent: {
        title: "Content for main website, blog, and Medium profile",
        url: "https://ipervox.medium.com/",
      },
      socialChannels: [
        {
          platform: "LinkedIn",
          url: "https://www.linkedin.com/company/ipervox/",
        },
        {
          platform: "Facebook",
          url: "https://www.facebook.com/ipervox/",
        },
        {
          platform: "Instagram",
          url: "https://www.instagram.com/ipervox/",
        },
      ],
      additionalNote: "Also created content for platforms like Quora, Reddit, etc.",
    },
    {
      id: "solis-marketing",
      title: "SolisMarketing",
      description: "Voluntary contributions to local marketing agency blog focusing on Kitsap County businesses",
      icon: <FileText className="w-8 h-8 text-[#fb6163]" />,
      stats: [
        { label: "Articles Written", value: "6 blog posts" },
        { label: "Focus Area", value: "Local SEO & Marketing" },
        { label: "Contribution Type", value: "Voluntary" },
      ],
      writingSamples: [
        {
          title: "How to Create a Winning Content Marketing Plan",
          url: "https://www.solismarketing.com/post/how-to-create-a-winning-content-marketing-plan-the-smart-way",
        },
        {
          title: "Effective SEO Strategies for Kitsap County Businesses",
          url: "https://www.solismarketing.com/post/effective-seo-strategies-for-kitsap-county-businesses",
        },
        {
          title: "Why Bremerton Businesses Need a Local Marketing Agency",
          url: "https://www.solismarketing.com/post/why-bremerton-businesses-need-a-local-marketing-agency",
        },
        {
          title: "How a Social Media Agency in Kitsap County Can Boost Your Online Presence",
          url: "https://www.solismarketing.com/post/how-a-social-media-agency-in-kitsap-county-can-boost-your-online-presence",
        },
        {
          title: "Top 5 Benefits of Hiring a Kitsap County Marketing Agency",
          url: "https://www.solismarketing.com/post/top-5-benefits-of-hiring-a-kitsap-county-marketing-agency",
        },
        {
          title: "How to Get Started with Digital Marketing in Kitsap County",
          url: "https://www.solismarketing.com/post/how-to-get-started-with-digital-marketing-kitsap-county",
        },
      ],
    },
    {
      id: "personal-blog",
      title: "Personal Blog",
      description: "My personal Medium blog where I share insights on digital marketing and SEO strategies",
      icon: <Globe className="w-8 h-8 text-[#fb6163]" />,
      stats: [
        { label: "Platform", value: "Medium" },
        { label: "Content Type", value: "Marketing Insights" },
        { label: "Audience", value: "Digital Marketers" },
      ],
      mainContent: {
        title: "Kejsan Coku – Medium",
        url: "https://medium.com/@kejsancoku",
      },
    },
  ]

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
              Kejsan
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
            {workSamples.map((sample) => (
              <Card
                key={sample.id}
                className="work-category bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="p-4 bg-gradient-to-r from-[#54a09b]/20 to-[#fb6163]/20 rounded-xl border border-[#fb6163]/30">
                      {sample.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-3">{sample.title}</h2>
                      <p className="text-white/80 text-lg mb-4">{sample.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {sample.stats.map((stat, i) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="text-[#fb6163] font-semibold text-sm">{stat.label}</div>
                            <div className="text-white font-medium">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Content Link */}
                  {sample.mainContent && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-4">Main Content Platform</h3>
                      <a
                        href={sample.mainContent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#54a09b] to-[#fb6163] text-white px-6 py-3 rounded-lg hover:from-[#54a09b]/90 hover:to-[#fb6163]/90 transition-all duration-300"
                      >
                        <Globe className="w-5 h-5" />
                        {sample.mainContent.title}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Social Channels */}
                  {sample.socialChannels && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        {sample.id === "cardo-ai"
                          ? "Social Media Channels I've Managed (up till June 1, 2024)"
                          : "Managed Social Media Channels"}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                          {sample.socialChannels.map((channel: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{channel.platform}</h4>
                              <a
                                href={channel.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#fb6163] hover:text-[#fb6163]/80 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                              {"description" in channel && (
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
                  {sample.writingSamples && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Published Writing Samples</h3>
                      <div className="grid gap-3">
                        {sample.writingSamples.map((article, i) => (
                          <a
                            key={i}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                          >
                            <span className="text-white group-hover:text-[#fb6163] transition-colors">
                              {article.title}
                            </span>
                            <ExternalLink className="w-4 h-4 text-white/60 group-hover:text-[#fb6163] transition-colors" />
                          </a>
                        ))}
                      </div>
                      {sample.id === "cardo-ai" && (
                        <p className="text-white/60 text-sm mt-4 italic">
                          These content pieces are among the articles I wrote. Authorship can be verified by contacting Cardo AI&apos;s HR department.
                        </p>
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
            ))}
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
              <a href="mailto:kejsan@example.com">
                <Button size="lg" className="bg-[#fb6163] hover:bg-[#fb6163]/90 text-white">
                  Get In Touch
                </Button>
              </a>
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
