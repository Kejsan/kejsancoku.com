import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type AdminCardProps = {
    title: string
    description?: string | null
    href?: string | null
    actions?: ReactNode
    footer?: ReactNode
    status?: "published" | "draft" | "scheduled" | "hidden"
    className?: string
    image?: string | null
}

export function AdminCard({
    title,
    description,
    href,
    actions,
    footer,
    status,
    className,
    image,
}: AdminCardProps) {
    return (
        <div
            className={cn(
                "group relative flex h-full flex-col justify-between rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md",
                className
            )}
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                        {href && (
                            <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary hover:underline"
                            >
                                {new URL(href).hostname}
                                <ArrowUpRight className="ml-1 h-3 w-3" />
                            </a>
                        )}
                    </div>
                    {status && (
                        <Badge
                            variant={
                                status === "published"
                                    ? "default"
                                    : status === "hidden"
                                        ? "secondary"
                                        : "outline"
                            }
                            className="capitalize"
                        >
                            {status}
                        </Badge>
                    )}
                </div>

                {description && (
                    <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}

                {image && (
                    <div className="mt-4 aspect-video w-full overflow-hidden rounded-md border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 p-6 pt-0">
                {footer && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {footer}
                    </div>
                )}

                {actions && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t mt-auto">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

export function AdminCardSkeleton() {
    return (
        <div className="flex h-[300px] flex-col justify-between rounded-xl border bg-card p-6 shadow-sm">
            <div className="space-y-3">
                <div className="h-5 w-1/2 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
                <div className="mt-4 h-20 w-full rounded bg-muted animate-pulse" />
            </div>
            <div className="mt-auto flex items-center justify-end gap-2">
                <div className="h-9 w-20 rounded bg-muted animate-pulse" />
                <div className="h-9 w-20 rounded bg-muted animate-pulse" />
            </div>
        </div>
    )
}
