import { ToolCardSkeleton } from "@/components/tools/tool-card"

export default function LoadingToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto h-10 w-40 rounded-full border border-white/10 bg-white/10" />
          <div className="mx-auto mt-6 h-10 w-3/4 rounded bg-white/10" />
          <div className="mx-auto mt-4 h-4 w-full rounded bg-white/5" />
          <div className="mx-auto mt-2 h-4 w-2/3 rounded bg-white/5" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ToolCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  )
}
