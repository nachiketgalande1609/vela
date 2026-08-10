export function WallpaperCardSkeleton() {
  return (
    <div className="rounded-[4px] bg-[var(--surface)] animate-pulse overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-2)]/60 via-transparent to-transparent" />
      <div className="absolute top-2 right-2 h-5 w-10 rounded-full bg-[var(--surface-2)]" />
      <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
        <div className="h-3 w-3/4 rounded bg-[var(--surface-2)]" />
        <div className="h-3 w-1/3 rounded bg-[var(--surface-2)]" />
      </div>
    </div>
  )
}

export function PackCardSkeleton() {
  return (
    <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden animate-pulse">
      <div className="grid grid-cols-2 aspect-square">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface-2)]" />
        ))}
      </div>
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-2/3 rounded bg-[var(--surface-2)]" />
          <div className="h-4 w-12 rounded bg-[var(--surface-2)]" />
        </div>
        <div className="h-3 w-full rounded bg-[var(--surface-2)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--surface-2)]" />
        <div className="h-2.5 w-1/3 rounded bg-[var(--surface-2)]" />
      </div>
    </div>
  )
}

export function OrderRowSkeleton() {
  return (
    <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-full bg-[var(--surface-2)]" />
          <div className="space-y-2">
            <div className="h-3.5 w-40 rounded bg-[var(--surface-2)]" />
            <div className="h-3 w-28 rounded bg-[var(--surface-2)]" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 rounded bg-[var(--surface-2)]" />
          <div className="h-7 w-20 rounded bg-[var(--surface-2)]" />
          <div className="h-4 w-4 rounded bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  )
}
