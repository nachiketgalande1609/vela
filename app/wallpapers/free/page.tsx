import { prisma } from '@/lib/db/prisma'
import { verifySession } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperCard } from '@/app/components/wallpapers/WallpaperCard'

export const metadata = { title: 'Free Wallpapers' }

export default async function FreeWallpapersPage() {
  const session = await verifySession()

  const wallpapers = await prisma.wallpaper.findMany({
    where: { published: true, isFree: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, price: true, category: true, thumbPath: true, isFree: true },
  })

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Free Wallpapers
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Download without signing in — no purchase needed.</p>
        </div>

        {wallpapers.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No free wallpapers yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {wallpapers.map((w) => (
              <WallpaperCard key={w.id} wallpaper={w} isAuthenticated={!!session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
