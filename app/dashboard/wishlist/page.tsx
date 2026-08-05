import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperCard } from '@/app/components/wallpapers/WallpaperCard'

export const metadata = { title: 'Saved Wallpapers' }

export default async function WishlistPage() {
  const session = await requireAuth()

  const items = await prisma.wishlist.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: {
      wallpaper: {
        select: { id: true, title: true, price: true, category: true, thumbPath: true, isFree: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <h1 className="text-lg font-semibold text-[var(--text)] mb-6">Saved Wallpapers</h1>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No saved wallpapers yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map(({ wallpaper }) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                isAuthenticated={true}
                wishlisted={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
