import { PublicNav } from '@/app/components/layout/PublicNav'
import { OrderRowSkeleton } from '@/app/components/ui/Skeletons'

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <div className="mb-6 space-y-2 animate-pulse">
          <div className="h-7 w-32 rounded bg-[var(--surface)]" />
          <div className="h-3 w-48 rounded bg-[var(--surface)]" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
