import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperBrowse } from '@/app/wallpapers/WallpaperBrowse'
import { HeroSection } from '@/app/components/home/HeroSection'

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

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <HeroSection isAuthenticated={!!session} hasSubscription={hasSubscription} />
      <WallpaperBrowse isAuthenticated={!!session} />
    </div>
  )
}
