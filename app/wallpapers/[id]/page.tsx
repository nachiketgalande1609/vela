import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/db/prisma'
import { verifySession } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PreviewImage } from '@/app/components/wallpapers/PreviewImage'
import { PurchaseButton } from '@/app/components/wallpapers/PurchaseButton'
import { DownloadButton } from '@/app/components/wallpapers/DownloadButton'
import { SubscribeButton } from '@/app/components/wallpapers/SubscribeButton'
import { canDownload } from '@/lib/wallpapers/can-download'
import { WallpaperCard } from '@/app/components/wallpapers/WallpaperCard'
import { PurchaseSuccessBanner } from './PurchaseSuccessBanner'
import { Tag } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id, published: true },
      select: { title: true },
    })
    return { title: wallpaper?.title ?? 'Wallpaper' }
  } catch {
    return { title: 'Wallpaper' }
  }
}

export default async function WallpaperDetailPage({ params }: PageProps) {
  const { id } = await params

  let wallpaper: { id: string; title: string; description: string | null; price: number; category: string; tags: string; previewPath: string; thumbPath: string; width: number; height: number; storagePath: string } | null = null
  let session: Awaited<ReturnType<typeof verifySession>> = null

  try {
    ;[wallpaper, session] = await Promise.all([
      prisma.wallpaper.findUnique({
        where: { id, published: true },
        select: {
          id: true, title: true, description: true, price: true,
          category: true, tags: true, previewPath: true, thumbPath: true,
          width: true, height: true, storagePath: true,
        },
      }),
      verifySession(),
    ])
  } catch {
    notFound()
  }

  if (!wallpaper) notFound()

  let canAccess = false
  let ownedIds: string[] = []
  let hasSubscription = false
  if (session) {
    try {
      const [access, sub, purchases] = await Promise.all([
        canDownload(session.id, id),
        prisma.subscription.findUnique({ where: { userId: session.id }, select: { status: true, currentPeriodEnd: true } }),
        prisma.purchase.findMany({ where: { userId: session.id }, select: { wallpaperId: true } }),
      ])
      canAccess = access
      hasSubscription = sub?.status === 'active' && new Date() < (sub?.currentPeriodEnd ?? 0)
      ownedIds = purchases.map((p) => p.wallpaperId)
    } catch { /* DB unavailable */ }
  }

  let related: { id: string; title: string; price: number; category: string; thumbPath: string }[] = []
  try {
    related = await prisma.wallpaper.findMany({
      where: { published: true, category: wallpaper.category, id: { not: id } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, price: true, category: true, thumbPath: true },
    })
  } catch { /* empty related on DB unavailable */ }

  const tags = wallpaper.tags.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <Suspense fallback={null}>
        <PurchaseSuccessBanner />
      </Suspense>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <PreviewImage
                src={wallpaper.previewPath}
                alt={wallpaper.title}
                width={600}
                height={1067}
                className="w-full rounded-[4px] border border-[var(--border)]"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {!canAccess && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[4px]">
                  <span className="rounded-[4px] bg-black/60 px-3 py-1.5 text-xs text-[var(--text-muted)] backdrop-blur-sm">
                    Preview only
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-block rounded-[4px] bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)] mb-3">
                {wallpaper.category}
              </span>
              <h1 className="text-3xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {wallpaper.title}
              </h1>
              {wallpaper.description && (
                <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">
                  {wallpaper.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[var(--accent)]" style={{ fontFamily: 'var(--font-playfair)' }}>
                ₹{wallpaper.price.toFixed(0)}
              </span>
              <span className="text-xs text-[var(--text-muted)]">one-time purchase</span>
            </div>

            {tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                {tags.map((tag) => (
                  <span key={tag} className="rounded-[4px] bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-[var(--border)] pt-6">
              {canAccess ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-[var(--accent)]">You have access to this wallpaper</p>
                  <DownloadButton wallpaperId={id} className="w-full justify-center" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <PurchaseButton
                    wallpaperId={id}
                    price={wallpaper.price}
                    isAuthenticated={!!session}
                  />
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--border)]" />
                    <span className="text-xs text-[var(--text-muted)]">or</span>
                    <div className="h-px flex-1 bg-[var(--border)]" />
                  </div>
                  <SubscribeButton isAuthenticated={!!session} className="w-full justify-center" />
                  <p className="text-center text-[10px] text-[var(--text-muted)]">
                    Subscribe once — download every wallpaper on Vela
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)] space-y-1">
              <p>Resolution: {wallpaper.width} × {wallpaper.height}px</p>
              <p>Format: {(wallpaper.storagePath.split('.').pop() ?? 'jpg').toUpperCase()}, optimised for mobile</p>
              <p>Licence: Personal use only</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-[var(--border)] pt-12">
            <h2 className="mb-6 text-xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              More like this
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {related.map((w) => (
                <WallpaperCard
                  key={w.id}
                  wallpaper={w}
                  isAuthenticated={!!session}
                  owned={hasSubscription || ownedIds.includes(w.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
