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
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="font-bold">
          Kejsan
        </Link>
        <div className="flex items-center space-x-4">
          {NAV_ITEMS.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1 text-sm text-white hover:text-muted-foreground"
            >
              <Icon className="w-4 h-4" />
              {name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

