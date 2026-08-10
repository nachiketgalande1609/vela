import { PublicNav } from '@/app/components/layout/PublicNav'
import { PackCardSkeleton } from '@/app/components/ui/Skeletons'

export default function PacksLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        {/* PageHeader skeleton */}
        <div className="mb-8 space-y-2 animate-pulse">
          <div className="h-3 w-32 rounded bg-[var(--surface)]" />
          <div className="h-7 w-48 rounded bg-[var(--surface)]" />
          <div className="h-3 w-56 rounded bg-[var(--surface)]" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {Array.from({ length: 6 }).map((_, i) => <PackCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
