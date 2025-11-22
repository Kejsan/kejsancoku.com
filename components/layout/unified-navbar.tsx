"use client"

import Link from "next/link"
import { NAV_LINKS } from "@/lib/navigation-links"
import { STATIC_SITE_SETTINGS } from "@/lib/static-site-settings"
import { usePathname } from "next/navigation"

export default function UnifiedNavbar() {
  const pathname = usePathname()
  const brandName = STATIC_SITE_SETTINGS.brandName || "Kejsan"

  const scrollToSection = (sectionId: string) => {
    if (pathname === "/") {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      // Navigate to homepage and then scroll
      window.location.href = `/#${sectionId}`
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-white font-bold text-xl hover:text-[#fb6163] transition-colors">
            {brandName}
          </Link>
          <div className="hidden md:flex space-x-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href.startsWith("/#") && pathname === "/")
              if (link.href.startsWith("/#")) {
                const sectionId = link.href.substring(2)
                return (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(sectionId)}
                    className={`transition-colors ${
                      isActive
                        ? "text-[#fb6163]"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </button>
                )
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors ${
                    isActive
                      ? "text-[#fb6163]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
          {/* Mobile menu button - can be enhanced later */}
          <div className="md:hidden">
            <button className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

