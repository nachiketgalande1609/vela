import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db/prisma'
import { verifySession } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { BuyPackButton } from '@/app/components/packs/BuyPackButton'
import { DownloadButton } from '@/app/components/wallpapers/DownloadButton'
import { CheckCircle2, Package } from 'lucide-react'

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const pack = await prisma.pack.findUnique({ where: { id, published: true }, select: { title: true } })
  return { title: pack?.title ?? 'Wallpaper Pack' }
}

export default async function PackDetailPage({ params }: PageProps) {
  const { id } = await params

  const [pack, session] = await Promise.all([
    prisma.pack.findUnique({
      where: { id, published: true },
      select: {
        id: true, title: true, description: true, price: true,
        wallpapers: {
          orderBy: { order: 'asc' },
          select: {
            wallpaper: {
              select: { id: true, title: true, thumbPath: true, previewPath: true, category: true, storagePath: true },
            },
          },
        },
        _count: { select: { wallpapers: true } },
      },
    }),
    verifySession(),
  ])

  if (!pack) notFound()

  let owned = false
  if (session) {
    if (session.role === 'ADMIN') {
      owned = true
    } else {
      const [packPurchase, sub] = await Promise.all([
        prisma.packPurchase.findUnique({
          where: { userId_packId: { userId: session.id, packId: id } },
          select: { id: true },
        }),
        prisma.subscription.findUnique({
          where: { userId: session.id },
          select: { status: true, currentPeriodEnd: true },
        }),
      ])
      owned = !!packPurchase || (sub?.status === 'active' && new Date() < (sub?.currentPeriodEnd ?? 0))
    }
  }

  const wallpapers = pack.wallpapers.map((w) => w.wallpaper)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader
          title={pack.title}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Packs', href: '/packs' }, { label: pack.title }]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          {/* Wallpaper grid */}
          <div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {wallpapers.map((w) => (
                <Link key={w.id} href={`/wallpapers/${w.id}`} className="relative rounded-[4px] border border-[var(--border)] overflow-hidden block" style={{ aspectRatio: '9/16' }}>
                  <Image
                    src={w.thumbPath}
                    alt={w.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 self-start space-y-5">
            <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-xs text-[var(--text-muted)]">{pack._count.wallpapers} wallpapers</span>
              </div>

              {pack.description && (
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{pack.description}</p>
              )}

              <div className="border-t border-[var(--border)] pt-4">
                {owned ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--accent)]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>You own this pack — download any wallpaper above</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[var(--accent)]">₹{pack.price.toFixed(0)}</span>
                      <span className="text-xs text-[var(--text-muted)]">one-time</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      ₹{(pack.price / pack._count.wallpapers).toFixed(0)} per wallpaper — save vs buying individually
                    </p>
                    <BuyPackButton
                      packId={pack.id}
                      price={pack.price}
                      isAuthenticated={!!session}
                      className="w-full justify-center"
                    />
                    <p className="text-[10px] text-[var(--text-muted)] text-center">
                      Or get all packs free with a subscription
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)] space-y-1">
              <p>Includes {pack._count.wallpapers} high-res wallpapers</p>
              <p>Optimised for mobile screens</p>
              <p>Personal use licence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
