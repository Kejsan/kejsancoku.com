import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MapPin, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { STATIC_SITE_SETTINGS } from "@/lib/static-site-settings"
import UnifiedNavbar from "@/components/layout/unified-navbar"

export const metadata: Metadata = {
  title: "Contact | Kejsan",
  description:
    "Reach out to Kejsan for consulting, growth marketing engagements, and collaboration opportunities.",
}

const FALLBACK_EMAIL = "hello@example.com"

export default function ContactPage() {
  const contactEmail = STATIC_SITE_SETTINGS.email || FALLBACK_EMAIL
  const location = STATIC_SITE_SETTINGS.contactLocation
  const availability = STATIC_SITE_SETTINGS.contactAvailability
  const contactMailto = `mailto:${contactEmail}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#000080] to-slate-900 text-white">
      <UnifiedNavbar />
      <div className="max-w-4xl mx-auto px-4 py-24 pt-32">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Let&apos;s Connect</h1>
          <p className="text-white/80 text-lg">
            Share a few project details and I&apos;ll get back to you within two business days.
          </p>
          <p className="text-white/60 mt-4">
            Prefer email? Reach me directly at{" "}
            <a className="underline decoration-[#fb6163] decoration-2 underline-offset-4" href={contactMailto}>
              {contactEmail}
            </a>
            .
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <form
            className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur"
            action={contactMailto}
            method="post"
            encType="text/plain"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="Name" placeholder="Jane Doe" required className="bg-white/10 border-white/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="bg-white/10 border-white/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company or Project</Label>
              <Input id="company" name="Company" placeholder="Acme Inc." className="bg-white/10 border-white/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">How can I help?</Label>
              <Textarea
                id="message"
                name="Message"
                placeholder="Share a quick overview of your goals, timeline, and budget."
                rows={5}
                required
                className="bg-white/10 border-white/20"
              />
            </div>
            <Button type="submit" size="lg" className="w-full bg-[#fb6163] hover:bg-[#fb6163]/90 text-white">
              Send Message
            </Button>
          </form>
          <aside className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-1 text-[#fb6163]" />
              <div>
                <p className="text-sm uppercase tracking-wide text-white/60">Email</p>
                <a className="text-white hover:text-[#fb6163] transition" href={contactMailto}>
                  {contactEmail}
                </a>
              </div>
            </div>
            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-[#fb6163]" />
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">Location</p>
                  <p>{location}</p>
                </div>
              </div>
            )}
            {availability && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-1 text-[#fb6163]" />
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">Availability</p>
                  <p>{availability}</p>
                </div>
              </div>
            )}
            <div className="pt-4 text-sm text-white/60">
              <p>
                Looking for more context first?{" "}
                <Link href="/" className="text-white hover:text-[#fb6163] transition">
                  Explore my work
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
