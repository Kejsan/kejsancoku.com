"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import {
  Bell,
  ChevronDown,
  LogOut,
  PlusCircle,
  Search,
  UserRound,
} from "lucide-react"

import type { AdminNavItem } from "@/app/admin/nav-items"
import { AdminMobileNav } from "@/components/admin/sidebar"
import { ThemeToggle } from "@/components/admin/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabaseClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

type AdminTopbarProps = {
  items: AdminNavItem[]
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function AdminTopbar({ items, user }: AdminTopbarProps) {
  const router = useRouter()
  const supabaseConfigured = isSupabaseConfigured
  const supabase = useMemo(
    () => (supabaseConfigured ? getSupabaseBrowserClient() : null),
    [supabaseConfigured],
  )
  const [signingOut, startSignOut] = useTransition()

  const initials =
    user?.name?.split(" ")
      .map((part) => part[0])
      .join("") || user?.email?.[0]?.toUpperCase() || "A"
  const displayName = user?.name ?? user?.email ?? "Admin"

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-background/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <AdminMobileNav items={items} />
        <Separator orientation="vertical" className="hidden h-6 md:block" />
        <form className="relative hidden max-w-sm flex-1 items-center md:flex">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search admin..."
            className="h-9 w-full rounded-lg pl-9"
            aria-label="Search admin"
          />
        </form>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>New content</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items
              .filter((item) => item.href !== "/admin")
              .map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={`${item.href}/new`}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Open notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              You&apos;re all caught up! 🎉
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={displayName} />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium leading-none">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email ?? "Signed in"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={displayName} />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? "admin@site"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="flex items-center gap-2">
                <UserRound className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                startSignOut(() => {
                  void (async () => {
                    if (supabase) {
                      await supabase.auth.signOut().catch((error) => {
                        console.error("Failed to sign out of Supabase", error)
                      })
                    }
                    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined)
                    router.replace("/admin/login")
                  })()
                })
              }}
              disabled={signingOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
