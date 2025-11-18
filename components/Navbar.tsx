import Link from "next/link"
import { type LucideIcon, AppWindow, Briefcase, Home, PenSquare, Wrench } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Blog", href: "/blog", icon: PenSquare },
  { name: "Work Samples", href: "/work-samples", icon: Briefcase },
  { name: "Apps", href: "/apps", icon: AppWindow },
  { name: "Tools", href: "/tools", icon: Wrench },
]

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Kejsan
        </Link>
        <div className="flex items-center gap-8">
          {NAV_ITEMS.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

