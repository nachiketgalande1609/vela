import { redirect } from 'next/navigation'
import { requireAuth, getUser } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { LogoutAllButton } from '@/app/components/auth/LogoutButton'
import { DownloadButton } from '@/app/components/wallpapers/DownloadButton'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'My Library — Vela' }

export default async function DashboardPage() {
  const session = await requireAuth()

  if (session.role === 'ADMIN') redirect('/admin/wallpapers')
  const isAdmin = false

  let user: Awaited<ReturnType<typeof getUser>> = null
  let purchases: {
    id: string
    wallpaper: { id: string; title: string; thumbPath: string; category: string }
  }[] = []
  let subscription: { status: string; currentPeriodEnd: Date } | null = null

  try {
    ;[user, purchases, subscription] = await Promise.all([
      getUser(session.id),
      prisma.purchase.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: 'desc' },
        include: {
          wallpaper: { select: { id: true, title: true, thumbPath: true, category: true } },
        },
      }),
      isAdmin ? Promise.resolve(null) : prisma.subscription.findUnique({
        where: { userId: session.id },
        select: { status: true, currentPeriodEnd: true },
      }),
    ])
  } catch { /* DB unavailable */ }

  const isSubscribed =
    subscription?.status === 'active' && new Date() < (subscription?.currentPeriodEnd ?? new Date(0))

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            My Library
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {user?.name ?? user?.email}
          </p>
        </div>

        {/* Admin panel / Subscription status */}
        {isAdmin ? (
          <div className="rounded-[4px] border border-[var(--accent)]/30 bg-[var(--surface)] p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent)] mb-1">Admin</p>
              <p className="text-sm text-[var(--text-muted)]">Manage the wallpaper catalogue, publish drafts, and upload new wallpapers.</p>
            </div>
            <Link
              href="/admin/wallpapers"
              className="shrink-0 rounded-[4px] bg-[var(--accent)] px-4 py-2 text-xs font-medium text-black hover:bg-[var(--accent-hover)] transition-colors"
            >
              Manage wallpapers
            </Link>
          </div>
        ) : (
          <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-1">Subscription</p>
              {isSubscribed ? (
                <p className="text-sm font-medium text-[var(--accent)]">
                  Active — renews {subscription!.currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No active subscription</p>
              )}
            </div>
            {!isSubscribed && (
              <Link
                href="/"
                className="shrink-0 rounded-[4px] border border-[var(--accent)]/40 px-4 py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
              >
                Browse &amp; Subscribe
              </Link>
            )}
          </div>
        )}

        {/* My Wallpapers */}
        <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)] mb-5">
            Purchased wallpapers
            {purchases.length > 0 && (
              <span className="ml-2 normal-case text-[var(--text)]">({purchases.length})</span>
            )}
          </h2>

          {purchases.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm text-[var(--text-muted)]">You haven&apos;t purchased any wallpapers yet.</p>
              <Link
                href="/"
                className="inline-block text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Browse the collection →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {purchases.map(({ wallpaper, id: purchaseId }) => (
                <div key={purchaseId} className="rounded-[4px] border border-[var(--border)] overflow-hidden bg-[var(--surface-2)]">
                  <Link href={`/wallpapers/${wallpaper.id}`}>
                    <div className="relative aspect-[9/16]">
                      <Image
                        src={wallpaper.thumbPath}
                        alt={wallpaper.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                  </Link>
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-[var(--text)] truncate">{wallpaper.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{wallpaper.category}</p>
                    </div>
                    <DownloadButton
                      wallpaperId={wallpaper.id}
                      className="w-full justify-center text-xs py-1.5 px-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session management */}
        <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)] mb-1">
            Session management
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Sign out from all devices. Use this if you think your account has been compromised.
          </p>
          <LogoutAllButton />
        </div>

      </div>
    </div>
  )
}
