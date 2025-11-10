import type { LucideIcon } from "lucide-react"
import { Mail, Linkedin, Github, Twitter, Link as LinkIcon, MapPin, Clock } from "lucide-react"
import type { SiteSettings } from "@prisma/client"

import { Button } from "@/components/ui/button"

interface ContactSectionProps {
  settings: SiteSettings | null
  isLoading?: boolean
  error?: string | null
}

const SOCIAL_LINKS: Record<
  keyof Pick<SiteSettings, "linkedin" | "github" | "x" | "threads">,
  {
    label: string
    icon: LucideIcon
  }
> = {
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
  },
  github: {
    label: "GitHub",
    icon: Github,
  },
  x: {
    label: "X",
    icon: Twitter,
  },
  threads: {
    label: "Threads",
    icon: LinkIcon,
  },
}

export default function ContactSection({ settings, isLoading = false, error = null }: ContactSectionProps) {
  if (isLoading) {
    return (
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/10 rounded w-2/3 mx-auto" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
            <div className="flex justify-center gap-6 pt-6">
              <div className="h-12 w-40 bg-white/10 rounded" />
              <div className="h-12 w-40 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Let&apos;s Grow Your Digital Presence</h2>
          <p className="text-white/80 text-lg mb-6">
            Ready to scale your brand&apos;s digital presence? I specialize in SEO strategy, content marketing, and
            growth-driven campaigns that deliver measurable results.
          </p>
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    )
  }

  const emailHref = settings?.email ? `mailto:${settings.email}` : null
  const headline = settings?.contactHeadline || "Let's Grow Your Digital Presence"
  const description =
    settings?.contactDescription ||
    "Ready to scale your brand's digital presence? I specialize in SEO strategy, content marketing, and growth-driven campaigns that deliver measurable results."
  const location = settings?.contactLocation
  const availability = settings?.contactAvailability
  const ctaLabel = settings?.contactCtaLabel || (emailHref ? "Email Me" : "Get in Touch")
  const ctaHref = settings?.contactCtaHref || (emailHref ?? undefined)

  const availableSocialLinks = (Object.keys(SOCIAL_LINKS) as (keyof typeof SOCIAL_LINKS)[])
    .map((key) => {
      const url = settings?.[key]
      if (!url) {
        return null
      }

      const { icon, label } = SOCIAL_LINKS[key]
      return { key, url, icon, label }
    })
    .filter((link): link is { key: keyof typeof SOCIAL_LINKS; url: string; icon: LucideIcon; label: string } =>
      Boolean(link?.url),
    )

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-8">{headline}</h2>
        <p className="text-white/80 text-lg mb-12">{description}</p>
        {(location || availability) && (
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm mb-8">
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
            {availability && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{availability}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-6">
          {ctaHref ? (
            <a href={ctaHref} target={ctaHref.startsWith("mailto:") ? "_self" : "_blank"} rel="noopener noreferrer">
              <Button size="lg" className="bg-[#fb6163] hover:bg-[#fb6163]/90 text-white">
                <Mail className="w-5 h-5 mr-2" />
                {ctaLabel}
              </Button>
            </a>
          ) : emailHref ? (
            <a href={emailHref}>
              <Button size="lg" className="bg-[#fb6163] hover:bg-[#fb6163]/90 text-white">
                <Mail className="w-5 h-5 mr-2" />
                {ctaLabel}
              </Button>
            </a>
          ) : (
            <Button size="lg" className="bg-[#fb6163]/50 text-white/70 cursor-not-allowed" disabled>
              <Mail className="w-5 h-5 mr-2" />
              Email Unavailable
            </Button>
          )}
          {availableSocialLinks.map(({ key, url, icon: Icon, label }) => (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </Button>
            </a>
          ))}
          {!emailHref && availableSocialLinks.length === 0 && (
            <p className="w-full text-white/60 text-sm mt-4">Contact details will be updated soon.</p>
          )}
        </div>
      </div>
    </section>
  )
}
