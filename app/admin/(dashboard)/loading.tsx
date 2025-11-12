export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="h-5 w-20 rounded-full bg-muted/70 animate-pulse" />
            <div className="h-10 w-16 rounded-md bg-muted/70 animate-pulse" />
            <div className="h-4 w-full rounded-md bg-muted/60 animate-pulse" />
            <div className="h-4 w-3/5 rounded-md bg-muted/60 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="h-6 w-32 rounded-md bg-muted/70 animate-pulse" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-40 rounded-md bg-muted/60 animate-pulse" />
              <div className="h-3 w-full rounded-md bg-muted/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
