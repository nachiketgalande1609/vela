export const dynamic = 'force-dynamic'
import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperBrowse } from '@/app/wallpapers/WallpaperBrowse'
import { HeroSection } from '@/app/components/home/HeroSection'
import { TrendingCarousel } from '@/app/components/home/TrendingCarousel'

export const metadata = { title: 'Vela — Premium Mobile Wallpapers' }

export default async function HomePage() {
  const session = await verifySession()

  let hasSubscription = false
  if (session) {
    try {
      const sub = await prisma.subscription.findUnique({
        where: { userId: session.id },
        select: { status: true, currentPeriodEnd: true },
      })
      hasSubscription = sub?.status === 'active' && new Date() < (sub?.currentPeriodEnd ?? 0)
    } catch {}
  }

  let trending: { id: string; title: string; thumbPath: string; category: string; price: number; isFree: boolean; _count: { purchases: number } }[] = []
  try {
    trending = await prisma.wallpaper.findMany({
      where: { published: true },
      orderBy: { purchases: { _count: 'desc' } },
      take: 8,
      select: { id: true, title: true, thumbPath: true, category: true, price: true, isFree: true, _count: { select: { purchases: true } } },
    })
  } catch {}

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <HeroSection isAuthenticated={!!session} hasSubscription={hasSubscription} />
      <TrendingCarousel wallpapers={trending} />
      <WallpaperBrowse isAuthenticated={!!session} />
    </div>
  )
}
