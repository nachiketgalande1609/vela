import { redirect } from 'next/navigation'
import { requireAuth, getUser } from '@/lib/auth/dal'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { User, Mail } from 'lucide-react'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import Link from 'next/link'
import { PurchasedGrid } from './PurchasedGrid'

export const metadata = { title: 'My Library' }

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

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        <PageHeader
          title="My Library"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Library' }]}
        />

        {/* User details */}
        <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[var(--surface-2)]">
              <User className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Full Name</p>
              <p className="mt-0.5 text-sm text-[var(--text)]">{user?.name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[var(--surface-2)]">
              <Mail className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Email</p>
              <p className="mt-0.5 text-sm text-[var(--text)]">{user?.email}</p>
            </div>
          </div>
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

          <PurchasedGrid
            purchases={purchases.map(({ wallpaper, id: purchaseId }) => ({ purchaseId, wallpaper }))}
          />
        </div>


      </div>
    </div>
  )
}
