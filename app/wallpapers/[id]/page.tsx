import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { prisma } from '@/lib/db/prisma'
import { verifySession } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PreviewImage } from '@/app/components/wallpapers/PreviewImage'
import { DownloadButton } from '@/app/components/wallpapers/DownloadButton'
import { SubscribeButton } from '@/app/components/wallpapers/SubscribeButton'
import { canDownload } from '@/lib/wallpapers/can-download'
import { WallpaperCard } from '@/app/components/wallpapers/WallpaperCard'
import { WallpaperDetailActions } from '@/app/components/wallpapers/WallpaperDetailActions'
import { PurchaseSuccessBanner } from './PurchaseSuccessBanner'
import { Tag, Package } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id, published: true },
      select: { title: true, category: true, thumbPath: true, price: true, isFree: true },
    })
    if (!wallpaper) return { title: 'Wallpaper' }
    const description = `Download "${wallpaper.title}" — a premium ${wallpaper.category.toLowerCase()} mobile wallpaper${wallpaper.isFree ? ' for free' : ` for ₹${wallpaper.price}`} on Vela.`
    return {
      title: wallpaper.title,
      description,
      openGraph: {
        title: wallpaper.title,
        description,
        images: [{ url: wallpaper.thumbPath, width: 400, height: 711, alt: wallpaper.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: wallpaper.title,
        description,
        images: [wallpaper.thumbPath],
      },
    }
  } catch {
    return { title: 'Wallpaper' }
  }
}

export default async function WallpaperDetailPage({ params }: PageProps) {
  const { id } = await params

  type WallpaperData = { id: string; title: string; description: string | null; price: number; category: string; tags: string; previewPath: string; thumbPath: string; width: number; height: number; storagePath: string; isFree: boolean }
  let wallpaper: WallpaperData | null = null
  let session: Awaited<ReturnType<typeof verifySession>> = null

  try {
    ;[wallpaper, session] = await Promise.all([
      prisma.wallpaper.findUnique({
        where: { id, published: true },
        select: {
          id: true, title: true, description: true, price: true,
          category: true, tags: true, previewPath: true, thumbPath: true,
          width: true, height: true, storagePath: true, isFree: true,
        },
      }),
      verifySession(),
    ])
  } catch {
    notFound()
  }

  if (!wallpaper) notFound()

  let canAccess = wallpaper.isFree
  let ownedIds: string[] = []
  let hasSubscription = false
  let ownedPackIds: string[] = []
  let initialWishlisted = false
  let initialInCart = false
  if (session) {
    try {
      const [access, sub, purchases, packPurchases, wishlistRow, cartRow] = await Promise.all([
        canDownload(session.id, id),
        prisma.subscription.findUnique({ where: { userId: session.id }, select: { status: true, currentPeriodEnd: true } }),
        prisma.purchase.findMany({ where: { userId: session.id }, select: { wallpaperId: true } }),
        prisma.packPurchase.findMany({ where: { userId: session.id }, select: { packId: true } }),
        prisma.wishlist.findUnique({ where: { userId_wallpaperId: { userId: session.id, wallpaperId: id } } }),
        prisma.cartItem.findUnique({ where: { userId_wallpaperId: { userId: session.id, wallpaperId: id } } }),
      ])
      canAccess = access
      hasSubscription = sub?.status === 'active' && new Date() < (sub?.currentPeriodEnd ?? 0)
      ownedIds = purchases.map((p) => p.wallpaperId)
      ownedPackIds = packPurchases.map((p) => p.packId)
      initialWishlisted = !!wishlistRow
      initialInCart = !!cartRow
    } catch { /* DB unavailable */ }
  }

  // Packs this wallpaper belongs to
  let wallpaperPacks: { id: string; title: string; price: number; _count: { wallpapers: number }; wallpapers: { wallpaper: { thumbPath: string } }[] }[] = []
  try {
    const rows = await prisma.wallpaperOnPack.findMany({
      where: { wallpaperId: id, pack: { published: true } },
      select: {
        pack: {
          select: {
            id: true, title: true, price: true,
            _count: { select: { wallpapers: true } },
            wallpapers: {
              take: 4,
              orderBy: { order: 'asc' },
              select: { wallpaper: { select: { thumbPath: true } } },
            },
          },
        },
      },
    })
    wallpaperPacks = rows.map((r) => r.pack)
  } catch { /* non-fatal */ }

  let related: { id: string; title: string; price: number; category: string; thumbPath: string }[] = []
  try {
    related = await prisma.wallpaper.findMany({
      where: { published: true, category: wallpaper.category, id: { not: id } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, price: true, category: true, thumbPath: true, isFree: true },
    })
  } catch { /* empty related on DB unavailable */ }

  const tags = wallpaper.tags.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <Suspense fallback={null}>
        <PurchaseSuccessBanner />
      </Suspense>

      <div className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
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
              <WallpaperDetailActions
                wallpaperId={id}
                isAuthenticated={!!session}
                initialWishlisted={initialWishlisted}
                initialInCart={initialInCart}
                owned={canAccess}
                isFree={wallpaper.isFree}
              />

              <div className="mt-3">
                {wallpaper.isFree ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-emerald-400">Free wallpaper — no purchase needed</p>
                    <DownloadButton wallpaperId={id} className="w-full justify-center" />
                  </div>
                ) : canAccess ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-[var(--accent)]">You have access to this wallpaper</p>
                    <DownloadButton wallpaperId={id} className="w-full justify-center" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <SubscribeButton isAuthenticated={!!session} className="w-full justify-center" />
                    <p className="text-center text-[10px] text-[var(--text-muted)]">
                      Vela+ — download every wallpaper on Vela
                    </p>
                  </div>
                )}
              </div>
            </div>

            {wallpaperPacks.length > 0 && (
              <div className="flex flex-col gap-3">
                {wallpaperPacks.map((pack) => {
                  const packOwned = ownedPackIds.includes(pack.id) || hasSubscription
                  return (
                    <div key={pack.id} className="rounded-[4px] border border-[var(--accent)]/20 bg-[var(--surface)] p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {/* 2×2 collage */}
                        <Link href={`/packs/${pack.id}`} className="shrink-0">
                          <div className="grid grid-cols-2 w-16 h-16 rounded-[3px] overflow-hidden">
                            {pack.wallpapers.slice(0, 4).map((w, i) => (
                              <div key={i} className="relative overflow-hidden">
                                <Image src={w.wallpaper.thumbPath} alt="" fill className="object-cover" sizes="32px" />
                              </div>
                            ))}
                            {Array.from({ length: Math.max(0, 4 - pack.wallpapers.length) }).map((_, i) => (
                              <div key={`e${i}`} className="bg-[var(--surface-2)]" />
                            ))}
                          </div>
                        </Link>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Also available in</p>
                          <Link href={`/packs/${pack.id}`} className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                            {pack.title}
                          </Link>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {pack._count.wallpapers} wallpapers · ₹{pack.price.toFixed(0)}
                          </p>
                        </div>
                      </div>
                      {packOwned ? (
                        <p className="text-xs text-[var(--accent)]">You own this pack</p>
                      ) : (
                        <Link
                          href={`/packs/${pack.id}`}
                          className="flex items-center justify-center gap-2 w-full rounded-[4px] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] transition-colors"
                        >
                          <Package className="h-4 w-4" />
                          View Pack — ₹{pack.price.toFixed(0)}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)] space-y-1">
              <p>Resolution: {wallpaper.width} × {wallpaper.height}px</p>
              <p>Format: {(wallpaper.storagePath.split('.').pop() ?? 'jpg').toUpperCase()}, optimised for mobile</p>
              <p>Licence: Personal use only</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-8 border-t border-[var(--border)] pt-6 sm:mt-16 sm:pt-12">
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
