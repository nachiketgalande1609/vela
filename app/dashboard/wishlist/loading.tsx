import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperCardSkeleton } from '@/app/components/ui/Skeletons'

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <div className="mb-6 space-y-2 animate-pulse">
          <div className="h-7 w-44 rounded bg-[var(--surface)]" />
          <div className="h-3 w-36 rounded bg-[var(--surface)]" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <WallpaperCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
