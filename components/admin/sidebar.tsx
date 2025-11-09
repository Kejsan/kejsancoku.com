"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { BadgeCheck, Menu } from "lucide-react"

import type { AdminNavItem } from "@/app/admin/nav-items"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function NavigationList({
  items,
  onNavigate,
}: {
  items: AdminNavItem[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
              isActive && "bg-muted text-primary",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <div className="flex flex-col">
              <span>{item.label}</span>
              {item.description ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({ items }: { items: AdminNavItem[] }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-card/60 px-5 py-6 backdrop-blur lg:w-72 md:flex md:flex-col">
      <div className="flex items-center gap-2 pb-6">
        <BadgeCheck className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Admin Console</p>
          <p className="text-xs text-muted-foreground">Manage site content</p>
        </div>
      </div>
      <Separator className="mb-4" />
      <NavigationList items={items} />
    </aside>
  )
}

export function AdminMobileNav({ items }: { items: AdminNavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs px-0 py-0">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <BadgeCheck className="h-5 w-5 text-primary" /> Admin Console
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Manage your site content and settings
          </p>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <NavigationList items={items} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
