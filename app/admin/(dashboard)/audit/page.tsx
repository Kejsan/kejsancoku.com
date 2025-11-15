import Link from "next/link"
import type { Audit, Prisma } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { isMissingAuditTableError } from "@/lib/audit"
import prisma from "@/lib/prisma"

const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE"] as const

type AuditAction = (typeof AUDIT_ACTIONS)[number]

type SearchParams = Record<string, string | string[] | undefined>

type PageProps = {
  searchParams?: SearchParams
}

function resolveParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined
}

function resolveAction(value: string | string[] | undefined): AuditAction | undefined {
  const normalized = resolveParam(value)?.toUpperCase() as AuditAction | undefined
  if (normalized && AUDIT_ACTIONS.includes(normalized)) {
    return normalized
  }
  return undefined
}

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

function actionVariant(action: AuditAction) {
  switch (action) {
    case "CREATE":
      return "secondary" as const
    case "UPDATE":
      return "default" as const
    case "DELETE":
      return "destructive" as const
    default:
      return "default" as const
  }
}

export default async function AuditPage({ searchParams }: PageProps) {
  if (!prisma) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Audit Trail</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The database connection is not configured. Configure <code>DATABASE_URL</code>
          {" "}to enable audit logging.
        </p>
      </div>
    )
  }

  const actionFilter = resolveAction(searchParams?.action)
  const entityTypeFilter = resolveParam(searchParams?.entityType)
  const query = resolveParam(searchParams?.q)

  const where: Prisma.AuditWhereInput = {}

  if (actionFilter) {
    where.action = actionFilter
  }

  if (entityTypeFilter) {
    where.entityType = entityTypeFilter
  }

  if (query) {
    where.OR = [
      { actorEmail: { contains: query, mode: "insensitive" } },
      { entityType: { contains: query, mode: "insensitive" } },
      { entityId: { contains: query, mode: "insensitive" } },
      { action: { contains: query, mode: "insensitive" } },
    ]
  }

  let audits: Audit[] = []
  let entityTypeRows: { entityType: string }[] = []
  let isAuditTableMissing = false

  try {
    const [auditRows, typeRows] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.audit.findMany({
        select: { entityType: true },
        distinct: ["entityType"],
      }),
    ])
    audits = auditRows
    entityTypeRows = typeRows
  } catch (error) {
    if (isMissingAuditTableError(error)) {
      console.warn("Audit table missing. Run migrations to enable audit logging.")
      audits = []
      entityTypeRows = []
      isAuditTableMissing = true
    } else {
      console.error("Failed to load audit entries", error)
      throw error
    }
  }

  const entityTypes = Array.from(
    new Set(entityTypeRows.map((row) => row.entityType)),
  ).sort((a, b) => a.localeCompare(b))

  const showEmptyState = !isAuditTableMissing && audits.length === 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">
          Review administrative activity and track changes across the system.
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-5" method="get">
        <Input
          name="q"
          placeholder="Search by actor, entity, or action"
          defaultValue={query ?? ""}
          className="md:col-span-2"
        />
        <select
          name="entityType"
          defaultValue={entityTypeFilter ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All entities</option>
          {entityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          name="action"
          defaultValue={actionFilter ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All actions</option>
          {AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Button type="submit" className="w-full">
            Apply filters
          </Button>
          <Button asChild variant="outline" type="button">
            <Link href="/admin/audit">Reset</Link>
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead className="hidden lg:table-cell">Details</TableHead>
              <TableHead className="w-48 text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>
                  <Badge variant={actionVariant(audit.action as AuditAction)}>
                    {audit.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{audit.entityType}</span>
                    <span className="text-xs text-muted-foreground">
                      #{audit.entityId}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {audit.actorEmail}
                </TableCell>
                <TableCell className="hidden max-w-lg text-xs lg:table-cell">
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted/50 p-2">
                    {JSON.stringify(audit.diff, null, 2)}
                  </pre>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatTimestamp(audit.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Showing up to the 100 most recent audit entries. Narrow your search to
            dive deeper.
          </TableCaption>
        </Table>
      </div>

      {isAuditTableMissing && (
        <div className="rounded-md border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">Audit table missing</h2>
          <p className="mt-2">
            Deploy the latest Prisma migrations with
            <code className="mx-1">pnpm exec prisma migrate deploy</code>
            using your Supabase connection to create the <code>Audit</code> table.
          </p>
          <p className="mt-2">Once the table exists, refresh this page to review activity logs.</p>
        </div>
      )}

      {showEmptyState && (
        <div className="rounded-md border border-dashed p-8 text-center">
          <h2 className="text-lg font-medium">No audit entries found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or check back after administrators make
            changes.
          </p>
        </div>
      )}
    </div>
  )
}
