export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { Package } from 'lucide-react'

export const metadata = { title: 'Wallpaper Packs' }

export default async function PacksPage() {
  let packs: Awaited<ReturnType<typeof prisma.pack.findMany>> = []
  try {
    packs = await prisma.pack.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, description: true, price: true,
        wallpapers: {
          take: 4,
          orderBy: { order: 'asc' },
          select: { wallpaper: { select: { thumbPath: true, title: true } } },
        },
        _count: { select: { wallpapers: true } },
      },
    })
  } catch {}

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <PageHeader
          title="Wallpaper Packs"
          subtitle="Curated bundles at one great price"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Packs' }]}
        />

        {packs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Package className="h-10 w-10 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">No packs available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {packs.map((pack) => (
              <Link key={pack.id} href={`/packs/${pack.id}`}>
                <div className="group rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden cursor-pointer hover:border-[var(--accent)]/40 transition-colors">
                  {/* 2x2 wallpaper grid preview */}
                  <div className="grid grid-cols-2 aspect-square">
                    {pack.wallpapers.slice(0, 4).map((w, i) => (
                      <div key={i} className="relative overflow-hidden">
                        <Image
                          src={w.wallpaper.thumbPath}
                          alt={w.wallpaper.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </div>
                    ))}
                    {/* fill empty slots if < 4 wallpapers */}
                    {Array.from({ length: Math.max(0, 4 - pack.wallpapers.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="bg-[var(--surface-2)]" />
                    ))}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-[var(--text)] leading-snug">{pack.title}</h2>
                      <span className="shrink-0 text-sm font-bold text-[var(--accent)]">₹{pack.price.toFixed(0)}</span>
                    </div>
                    {pack.description && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">{pack.description}</p>
                    )}
                    <p className="text-[10px] text-[var(--text-muted)]">{pack._count.wallpapers} wallpapers included</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
