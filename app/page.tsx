import { verifySession } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperBrowse } from '@/app/wallpapers/WallpaperBrowse'

export const metadata = { title: 'Browse Wallpapers' }

export default async function HomePage() {
  const session = await verifySession()

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <WallpaperBrowse isAuthenticated={!!session} />
    </div>
  )
}
