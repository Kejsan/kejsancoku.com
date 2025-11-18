import Link from "next/link"
import { Github, Linkedin, Mail, Twitter } from "lucide-react"

import { NAV_LINKS } from "@/lib/navigation-links"
import { STATIC_SITE_SETTINGS } from "@/lib/static-site-settings"

const SOCIAL_LINKS = (
  [
    {
      label: "LinkedIn",
      href: STATIC_SITE_SETTINGS.linkedin,
      icon: Linkedin,
    },
    {
      label: "GitHub",
      href: STATIC_SITE_SETTINGS.github,
      icon: Github,
    },
    {
      label: "X",
      href: STATIC_SITE_SETTINGS.x,
      icon: Twitter,
    },
    {
      label: "Email",
      href: STATIC_SITE_SETTINGS.email
        ? `mailto:${STATIC_SITE_SETTINGS.email}`
        : null,
      icon: Mail,
    },
  ] as const
).filter((link) => Boolean(link.href))

const QUICK_LINKS = NAV_LINKS.map(({ name, href }) => ({ name, href }))

const FOCUS_AREAS = [
  "SEO & organic growth strategy",
  "Content marketing systems",
  "Product launch positioning",
  "Marketing analytics & reporting",
]

export default function StaticFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-slate-900/50 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white">
              {STATIC_SITE_SETTINGS.brandName}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {STATIC_SITE_SETTINGS.brandRole}
            </p>
            <p className="mt-3 max-w-sm text-sm text-slate-400/90">
              {STATIC_SITE_SETTINGS.brandDescription}
            </p>
            <div className="mt-4 flex space-x-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href ?? undefined}
                  target={href?.startsWith("mailto:") ? "_self" : "_blank"}
                  rel="noreferrer noopener"
                  className="text-slate-400 transition-colors hover:text-white"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-base font-semibold text-slate-200">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-base font-semibold text-slate-200">Focus Areas</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {FOCUS_AREAS.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-base font-semibold text-slate-200">Connect</h3>
            <p className="mt-4 text-sm text-slate-400">
              {STATIC_SITE_SETTINGS.footerTagline}
            </p>
            <a
              href={STATIC_SITE_SETTINGS.footerCtaHref ?? "#contact"}
              className="mt-2 inline-block text-sm font-semibold text-[#54a09b] transition-colors hover:text-[#54a09b]/90"
            >
              {STATIC_SITE_SETTINGS.footerCtaLabel}
            </a>
            {STATIC_SITE_SETTINGS.footerNote && (
              <p className="mt-4 text-xs text-slate-500">
                {STATIC_SITE_SETTINGS.footerNote}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-slate-400">
          <p>
            © {currentYear} {STATIC_SITE_SETTINGS.brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
