"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronUp } from "lucide-react"
import type { SiteSettings } from "@prisma/client"
import { NAV_LINKS } from "@/lib/navigation-links"

import HeroSection from "@/components/sections/hero-section"
import AboutSection from "@/components/sections/about-section"
import SkillsSection from "@/components/sections/skills-section"
import ExperienceSection from "@/components/sections/experience-section"
import BlogSection from "@/components/sections/blog-section"
import NewsletterSection from "@/components/sections/newsletter-section"
import ContactSection from "@/components/sections/contact-section"

export default function Portfolio() {
  const skillsRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const blogRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    // Load anime.js dynamically
    const loadAnime = async () => {
      try {
        const anime = (await import("animejs")).default as any

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

        // Section animations on scroll
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                if (entry.target.classList.contains("skills-section")) {
                  anime({
                    targets: ".skill-card",
                    scale: [0.8, 1],
                    opacity: [0, 1],
                    duration: 600,
                    delay: anime.stagger(100),
                    easing: "easeOutBack",
                  })
                }
                if (entry.target.classList.contains("experience-section")) {
                  anime({
                    targets: ".experience-card",
                    translateX: [-50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    delay: anime.stagger(150),
                    easing: "easeOutExpo",
                  })
                }
                if (entry.target.classList.contains("blog-section")) {
                  anime({
                    targets: ".blog-card",
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    delay: anime.stagger(150),
                    easing: "easeOutExpo",
                  })
                }
              }
            })
          },
          { threshold: 0.1 },
        )

        if (skillsRef.current) observer.observe(skillsRef.current)
        if (experienceRef.current) observer.observe(experienceRef.current)
        if (blogRef.current) observer.observe(blogRef.current)

        return () => observer.disconnect()
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

  useEffect(() => {
    fetch("/api/footer")
      .then((res) => res.json())
      .then((data: SiteSettings | null) => setSettings(data))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-white font-bold text-xl">Kejsan</div>
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

      <SkillsSection ref={skillsRef} />

      <ExperienceSection ref={experienceRef} />

      <BlogSection ref={blogRef} />

      <NewsletterSection />

      <ContactSection />

      {/* Footer */}
      {settings && (
        <footer className="py-8 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center text-white/60">
            {settings.copyright}
            {settings.linkedin && (
              <>
                {" "}|{" "}
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[#54a09b] hover:text-[#54a09b]/80 transition-colors"
                >
                  LinkedIn
                </a>
              </>
            )}
            {settings.github && (
              <>
                {" "}|{" "}
                <a
                  href={settings.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[#54a09b] hover:text-[#54a09b]/80 transition-colors"
                >
                  GitHub
                </a>
              </>
            )}
            {settings.email && (
              <>
                {" "}|{" "}
                <a
                  href={`mailto:${settings.email}`}
                  className="text-[#54a09b] hover:text-[#54a09b]/80 transition-colors"
                >
                  Email
                </a>
              </>
            )}
          </div>
        </footer>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-[#fb6163] hover:bg-[#fb6163]/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

    </div>
  )
}
