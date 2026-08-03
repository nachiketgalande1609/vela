import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { AdminWallpapersClient } from './AdminWallpapersClient'

export const metadata = { title: 'Manage Wallpapers — Vela' }

export default async function AdminWallpapersPage() {
  await requireAdmin()

  const wallpapers = await prisma.wallpaper.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, price: true, category: true,
      published: true, thumbPath: true, createdAt: true,
    },
  })

  const rows = wallpapers.map((w) => ({ ...w, createdAt: w.createdAt.toISOString() }))

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <AdminWallpapersClient initial={rows} />
      </div>
    </div>
  )
}
