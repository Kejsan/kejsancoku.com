import type { Metadata } from "next"

import PageLayout from "@/components/layout/page-layout"
import PageHero from "@/components/sections/page-hero"
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
    <PageLayout>
      <PageHero
        eyebrow="Tool Stack"
        title="Tools that supercharge my marketing work"
        description="From analytics platforms to creative suites, here are the products I rely on to deliver measurable growth."
      />

      {error ? (
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-center text-sm text-red-400">
            {error}
          </div>
        </section>
      ) : null}

      <section className="px-4 pb-16">
        {hasTools ? (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 backdrop-blur px-8 py-16 text-center text-white/70">
            <h2 className="text-xl font-semibold text-white">No tools to share just yet</h2>
            <p className="max-w-xl text-sm">
              Check back soon for a curated list of analytics, automation, and content platforms powering my work.
            </p>
          </div>
        )}
      </section>
    </PageLayout>
  )
}
