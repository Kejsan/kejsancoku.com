"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronUp } from "lucide-react"
import { NAV_LINKS } from "@/lib/navigation-links"
import { STATIC_SITE_SETTINGS } from "@/lib/static-site-settings"

import HeroSection from "@/components/sections/hero-section"
import AboutSection from "@/components/sections/about-section"
import ExperiencePreview from "@/components/sections/experience-preview"
import InfiniteSkillsMarquee from "@/components/sections/infinite-skills-marquee"
import BlogSection from "@/components/sections/blog-section"
import NewsletterSection from "@/components/sections/newsletter-section"
import ContactSection from "@/components/sections/contact-section"
import WorkSamplesPreview from "@/components/sections/work-samples-preview"

export default function Portfolio() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    // Load anime.js dynamically
    const loadAnime = async () => {
      try {
        const animeModule = (await import("animejs")) as any
        const anime = animeModule.default ?? animeModule

        // Hero animations
        anime
          .timeline({
            easing: "easeOutExpo",
          })
          .add({
            targets: ".hero-title",
            translateY: [100, 0],
            opacity: [0, 1],
            duration: 1200,
          })
          .add(
            {
              targets: ".hero-subtitle",
              translateY: [50, 0],
              opacity: [0, 1],
              duration: 800,
            },
            "-=600",
          )
          .add(
            {
              targets: ".hero-description",
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 600,
            },
            "-=400",
          )
          .add(
            {
              targets: ".hero-image",
              scale: [0.8, 1],
              opacity: [0, 1],
              duration: 800,
            },
            "-=400",
          )

        // Floating animation for hero elements
        anime({
          targets: ".floating-element",
          translateY: [-10, 10],
          duration: 3000,
          direction: "alternate",
          loop: true,
          easing: "easeInOutSine",
          delay: anime.stagger(200),
        })

      } catch (error) {
        console.log("Anime.js not available, using CSS animations as fallback")
        // Fallback: just show elements without animations
        const elements = document.querySelectorAll(
          ".hero-title, .hero-subtitle, .hero-description, .hero-buttons, .hero-image",
        )
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const brandName = STATIC_SITE_SETTINGS.brandName || "Kejsan"
  const contactEmail = STATIC_SITE_SETTINGS.email
  const scrollButtonLabel = contactEmail
    ? `Scroll to top and contact ${contactEmail}`
    : "Scroll to top"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-white font-bold text-xl">{brandName}</div>
            <div className="hidden md:flex space-x-8">
              {NAV_LINKS.map((link) => {
                if (link.href.startsWith("/#")) {
                  const sectionId = link.href.substring(2);
                  return (
                    <button
                      key={link.name}
                      onClick={() => scrollToSection(sectionId)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {link.name}
                    </button>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <HeroSection scrollToSection={scrollToSection} />

      <AboutSection />

      <ExperiencePreview />

      <InfiniteSkillsMarquee />

      <WorkSamplesPreview />

      <BlogSection />

      <NewsletterSection />

      <ContactSection settings={STATIC_SITE_SETTINGS} />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#fb6163] hover:bg-[#fb6163]/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label={scrollButtonLabel}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

    </div>
  )
}
