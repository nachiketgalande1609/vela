export const dynamic = 'force-dynamic'
import { unstable_cache } from 'next/cache'
import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperBrowse } from '@/app/wallpapers/WallpaperBrowse'
import { HeroSection } from '@/app/components/home/HeroSection'
import { TrendingCarousel } from '@/app/components/home/TrendingCarousel'
import type { WallpaperCardData } from '@/app/components/wallpapers/WallpaperCard'

export const metadata = { title: 'Vela — Premium Mobile Wallpapers' }

const PAGE_SIZE = 12

const getCachedTrending = unstable_cache(
  () => prisma.wallpaper.findMany({
    where: { published: true },
    orderBy: { purchases: { _count: 'desc' } },
    take: 8,
    select: { id: true, title: true, thumbPath: true, category: true, price: true, isFree: true, _count: { select: { purchases: true } } },
  }),
  ['trending-wallpapers'],
  { revalidate: 300 },
)

export default async function HomePage() {
  const session = await verifySession()

  const [sub, trending, wallpapersResult] = await Promise.all([
    session
      ? prisma.subscription.findUnique({ where: { userId: session.id }, select: { status: true, currentPeriodEnd: true } })
      : Promise.resolve(null),
    getCachedTrending().catch(() => []),
    (async () => {
      const where = { published: true }
      const [rows, total, wishlistItems] = await Promise.all([
        prisma.wallpaper.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: PAGE_SIZE,
          select: { id: true, title: true, price: true, category: true, thumbPath: true, tags: true, isFree: true },
        }),
        prisma.wallpaper.count({ where }),
        session
          ? prisma.wishlist.findMany({ where: { userId: session.id }, select: { wallpaperId: true } })
          : Promise.resolve([]),
      ])
      const wishlisted = new Set(wishlistItems.map((w) => w.wallpaperId))
      const wallpapers: WallpaperCardData[] = rows.map((w) => ({ ...w, wishlisted: wishlisted.has(w.id) }))
      return { wallpapers, pages: Math.ceil(total / PAGE_SIZE) }
    })().catch(() => ({ wallpapers: [], pages: 0 })),
  ])

  const hasSubscription = sub?.status === 'active' && new Date() < (sub?.currentPeriodEnd ?? 0)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <HeroSection isAuthenticated={!!session} hasSubscription={hasSubscription} />
      <TrendingCarousel wallpapers={trending} />
      <WallpaperBrowse
        isAuthenticated={!!session}
        initialWallpapers={wallpapersResult.wallpapers}
        initialPages={wallpapersResult.pages}
      />
    </div>
  )
}
