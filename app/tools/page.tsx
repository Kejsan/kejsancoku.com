import type { Metadata } from "next"

import { ToolCard, type ToolSummary } from "@/components/tools/tool-card"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Tools | Kejsan Coku",
  description:
    "Explore the marketing, analytics, and content tools that power my daily work.",
}

export const revalidate = 3600

type ToolsResponse = {
  tools: ToolSummary[]
  error: string | null
}

async function getTools(): Promise<ToolsResponse> {
  if (!prisma) {
    return {
      tools: [],
      error: "Database connection is not configured. Configure DATABASE_URL to load tools.",
    }
  }

  try {
    const tools = await prisma.tool.findMany({
      orderBy: { createdAt: "desc" },
    })

    return {
      tools: tools.map((tool) => ({
        id: tool.id,
        name: tool.name,
        url: tool.url,
        description: tool.description,
      })),
      error: null,
    }
  } catch (error) {
    console.error("[ToolsPage] Failed to load tools", error)
    return {
      tools: [],
      error: "We couldn't load the tools right now. Please try again later.",
    }
  }
}

export default async function ToolsPage() {
  const { tools, error } = await getTools()
  const hasTools = tools.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
            Tool Stack
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Tools that supercharge my marketing work
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 md:text-lg">
            From analytics platforms to creative suites, here are the products I rely on to deliver measurable growth.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {hasTools ? (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 px-8 py-16 text-center text-white/70">
            <h2 className="text-xl font-semibold text-white">No tools to share just yet</h2>
            <p className="max-w-xl text-sm text-white/60">
              Check back soon for a curated list of analytics, automation, and content platforms powering my work.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
