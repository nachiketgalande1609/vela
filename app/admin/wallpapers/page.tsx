import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { AdminWallpapersClient } from './AdminWallpapersClient'

export const metadata = { title: 'Manage Wallpapers' }

export default async function AdminWallpapersPage() {
  await requireAdmin()

  const [wallpapers, allPacks] = await Promise.all([
    prisma.wallpaper.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, price: true, category: true,
        published: true, thumbPath: true, createdAt: true, isFree: true,
        packs: { select: { pack: { select: { id: true, title: true } } } },
      },
    }),
    prisma.pack.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
  ])

  const rows = wallpapers.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    packs: w.packs.map((p) => p.pack),
  }))

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <AdminWallpapersClient initial={rows} allPacks={allPacks} />
      </div>
    </div>
  )
}
