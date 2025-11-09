import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import prisma from "@/lib/prisma"

type DashboardStat = {
  key: string
  title: string
  href: string
  count: number
  description: string
  emptyDescription: string
  actionLabel: string
}

type RawAuditEntry = {
  id?: string | number
  actor?: string | null
  actorName?: string | null
  userEmail?: string | null
  userName?: string | null
  entity?: string | null
  entityName?: string | null
  entityType?: string | null
  entityId?: string | number | null
  resource?: string | null
  action?: string | null
  event?: string | null
  createdAt?: Date | string | null
} & Record<string, unknown>

type AuditEntry = {
  id: string
  actor: string
  entity: string
  action?: string
  createdAt: Date | null
}

function normalizeAuditEntry(entry: RawAuditEntry, index: number): AuditEntry {
  const actor =
    entry.actor ||
    entry.actorName ||
    entry.userEmail ||
    entry.userName ||
    "System"

  const entityCandidates = [
    entry.entity,
    entry.entityName,
    entry.resource,
  ].filter((value): value is string => typeof value === "string" && value.length > 0)

  if (entityCandidates.length === 0) {
    const entityType =
      typeof entry.entityType === "string" ? entry.entityType : undefined
    const entityId =
      typeof entry.entityId === "string" || typeof entry.entityId === "number"
        ? `#${entry.entityId}`
        : undefined
    const fallback = [entityType, entityId].filter(Boolean).join(" ")
    if (fallback) {
      entityCandidates.push(fallback)
    }
  }

  const entity = entityCandidates.join(" ") || "Content"
  const action =
    (typeof entry.action === "string" && entry.action.length > 0
      ? entry.action
      : undefined) ??
    (typeof entry.event === "string" && entry.event.length > 0
      ? entry.event
      : undefined)

  let createdAt: Date | null = null
  if (entry.createdAt instanceof Date) {
    createdAt = entry.createdAt
  } else if (typeof entry.createdAt === "string") {
    const parsed = new Date(entry.createdAt)
    if (!Number.isNaN(parsed.getTime())) {
      createdAt = parsed
    }
  }

  return {
    id: String(entry.id ?? index),
    actor,
    entity,
    action,
    createdAt,
  }
}

async function getAuditEntries(): Promise<AuditEntry[]> {
  const prismaAny = prisma as Record<string, any>
  const auditClientKey = Object.keys(prismaAny).find((key) => {
    if (!key.toLowerCase().includes("audit")) return false
    const candidate = prismaAny[key] as { findMany?: unknown } | undefined
    return typeof candidate?.findMany === "function"
  })

  if (!auditClientKey) {
    return []
  }

  try {
    const auditClient = prismaAny[auditClientKey] as {
      findMany: (args: { orderBy: { createdAt: "asc" | "desc" }; take: number }) => Promise<RawAuditEntry[]>
    }

    const entries = await auditClient.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
    })

    if (!Array.isArray(entries)) {
      return []
    }

    return entries.map((entry, index) => normalizeAuditEntry(entry, index))
  } catch (error) {
    return []
  }
}

async function getDashboardStats(): Promise<DashboardStat[]> {
  const [posts, apps, tools, experiences, workSamples] = await Promise.all([
    prisma.post.count(),
    prisma.webApp.count(),
    prisma.tool.count(),
    prisma.experience.count(),
    prisma.workSample.count(),
  ])

  return [
    {
      key: "posts",
      title: "Posts",
      href: "/admin/posts",
      count: posts,
      description: `You have ${posts} published post${posts === 1 ? "" : "s"}.`,
      emptyDescription: "Share your expertise by publishing your first post.",
      actionLabel: "Create post",
    },
    {
      key: "apps",
      title: "Apps",
      href: "/admin/apps",
      count: apps,
      description: `${apps} app${apps === 1 ? "" : "s"} showcased on your site.`,
      emptyDescription: "Highlight your standout apps to engage visitors.",
      actionLabel: "Create app",
    },
    {
      key: "tools",
      title: "Tools",
      href: "/admin/tools",
      count: tools,
      description: `${tools} tool${tools === 1 ? "" : "s"} documented in your stack.`,
      emptyDescription: "Document the tools you rely on to build trust.",
      actionLabel: "Create tool",
    },
    {
      key: "experiences",
      title: "Experiences",
      href: "/admin/experiences",
      count: experiences,
      description: `${experiences} experience${experiences === 1 ? "" : "s"} shaping your story.`,
      emptyDescription: "Add career milestones to tell your professional story.",
      actionLabel: "Create experience",
    },
    {
      key: "work-samples",
      title: "Work samples",
      href: "/admin/worksamples",
      count: workSamples,
      description: `${workSamples} work sample${workSamples === 1 ? "" : "s"} published.`,
      emptyDescription: "Showcase the projects you are proud of.",
      actionLabel: "Create sample",
    },
  ]
}

export default async function AdminDashboard() {
  const [stats, auditEntries] = await Promise.all([
    getDashboardStats(),
    getAuditEntries(),
  ])

  const hasAnyContent = stats.some((stat) => stat.count > 0)

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Monitor your content at a glance and jump into action when inspiration strikes.
        </p>
      </header>

      {!hasAnyContent && (
        <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
          <p className="font-medium">You haven&apos;t published anything yet.</p>
          <p className="text-sm text-muted-foreground">
            Use the quick actions below to create your first entries and bring the site to life.
          </p>
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <Badge variant="secondary">{stat.title}</Badge>
                <CardAction>
                  <Button asChild size="sm" variant="outline">
                    <Link href={stat.href}>{stat.actionLabel}</Link>
                  </Button>
                </CardAction>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardTitle className="text-4xl font-bold tracking-tight">
                {stat.count}
              </CardTitle>
              <CardDescription>
                {stat.count > 0 ? stat.description : stat.emptyDescription}
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.count > 0
                  ? `Stay on top of your ${stat.title.toLowerCase()}.`
                  : "Start building this collection."}
              </span>
              <Badge variant="outline">{stat.title}</Badge>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section>
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Track changes across your portfolio as they happen.
              </CardDescription>
            </div>
            <Badge variant="outline">
              {auditEntries.length ? `${auditEntries.length} update${auditEntries.length === 1 ? "" : "s"}` : "No activity"}
            </Badge>
          </CardHeader>
          <CardContent>
            {auditEntries.length ? (
              <ul className="space-y-4">
                {auditEntries.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{entry.actor}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.action ? `${entry.action} · ${entry.entity}` : entry.entity}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {entry.createdAt
                        ? formatDistanceToNow(entry.createdAt, { addSuffix: true })
                        : "Just now"}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p className="text-sm font-medium">No recent activity yet</p>
                <p className="text-xs">
                  Audit entries will appear here once changes are made to your content.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
