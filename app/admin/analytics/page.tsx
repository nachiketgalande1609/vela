export const dynamic = 'force-dynamic'
import { requireAdmin } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { prisma } from '@/lib/db/prisma'
import { TrendingUp, ShoppingBag, Users, CreditCard, Package, Heart } from 'lucide-react'
import Image from 'next/image'

export const metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  await requireAdmin()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalSales,
    monthSales,
    totalUsers,
    monthUsers,
    activeSubscriptions,
    packRevenue,
    topWallpapers,
    recentSales,
    revenueByCategory,
    wishlistCounts,
  ] = await Promise.all([
    // Total revenue from wallpaper purchases
    prisma.purchase.aggregate({ _sum: { amount: true } }),
    // This month revenue
    prisma.purchase.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    // Last month revenue
    prisma.purchase.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { amount: true } }),
    // Total sales count
    prisma.purchase.count(),
    // This month sales
    prisma.purchase.count({ where: { createdAt: { gte: startOfMonth } } }),
    // Total users
    prisma.user.count({ where: { role: 'USER' } }),
    // New users this month
    prisma.user.count({ where: { createdAt: { gte: startOfMonth }, role: 'USER' } }),
    // Active subscriptions
    prisma.subscription.count({ where: { status: 'active', currentPeriodEnd: { gte: now } } }),
    // Pack revenue
    prisma.packPurchase.aggregate({ _sum: { amount: true } }),
    // Top selling wallpapers
    prisma.purchase.groupBy({
      by: ['wallpaperId'],
      _count: { wallpaperId: true },
      _sum: { amount: true },
      orderBy: { _count: { wallpaperId: 'desc' } },
      take: 5,
    }),
    // Recent 8 sales
    prisma.purchase.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        wallpaper: { select: { title: true, thumbPath: true, category: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    // Revenue by category
    prisma.purchase.findMany({
      include: { wallpaper: { select: { category: true } } },
    }),
    // Most wishlisted
    prisma.wishlist.groupBy({
      by: ['wallpaperId'],
      _count: { wallpaperId: true },
      orderBy: { _count: { wallpaperId: 'desc' } },
      take: 5,
    }),
  ])

  // Wallpaper details for top sellers and wishlisted
  const topWallpaperIds = topWallpapers.map((t) => t.wallpaperId)
  const wishlistIds = wishlistCounts.map((w) => w.wallpaperId)
  const [topWallpaperDetails, wishlistDetails] = await Promise.all([
    prisma.wallpaper.findMany({ where: { id: { in: topWallpaperIds } }, select: { id: true, title: true, thumbPath: true, category: true } }),
    prisma.wallpaper.findMany({ where: { id: { in: wishlistIds } }, select: { id: true, title: true, thumbPath: true } }),
  ])

  const topWallpaperMap = Object.fromEntries(topWallpaperDetails.map((w) => [w.id, w]))
  const wishlistMap = Object.fromEntries(wishlistDetails.map((w) => [w.id, w]))

  // Category revenue
  const catRevMap: Record<string, number> = {}
  for (const p of revenueByCategory) {
    const cat = p.wallpaper.category
    catRevMap[cat] = (catRevMap[cat] ?? 0) + p.amount
  }
  const categoryRevenue = Object.entries(catRevMap).sort((a, b) => b[1] - a[1])
  const maxCatRev = categoryRevenue[0]?.[1] ?? 1

  const wallpaperRev = totalRevenue._sum.amount ?? 0
  const packRev = packRevenue._sum.amount ?? 0
  const grandTotal = wallpaperRev + packRev
  const thisMonth = monthRevenue._sum.amount ?? 0
  const lastMonth = lastMonthRevenue._sum.amount ?? 0
  const revenueGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Revenue',
      value: `₹${grandTotal.toFixed(0)}`,
      sub: `₹${thisMonth.toFixed(0)} this month`,
      growth: revenueGrowth,
      accent: true,
    },
    {
      icon: ShoppingBag,
      label: 'Total Sales',
      value: totalSales,
      sub: `${monthSales} this month`,
      growth: null,
      accent: false,
    },
    {
      icon: Users,
      label: 'Total Users',
      value: totalUsers,
      sub: `${monthUsers} new this month`,
      growth: null,
      accent: false,
    },
    {
      icon: CreditCard,
      label: 'Active Subscriptions',
      value: activeSubscriptions,
      sub: `₹${(activeSubscriptions * 199).toFixed(0)}/mo recurring`,
      growth: null,
      accent: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">

        <PageHeader
          title="Analytics"
          subtitle="Revenue, sales, and platform performance"
          breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Analytics' }]}
        />

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, sub, growth, accent }) => (
            <div key={label} className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-[4px] ${accent ? 'bg-[var(--accent)]/15' : 'bg-[var(--surface-2)]'}`}>
                <Icon className={`h-4 w-4 ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
              <p className="mt-1 text-3xl font-bold text-[var(--text)]">{value}</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-[var(--text-muted)]">{sub}</p>
                {growth !== null && (
                  <span className={`text-[10px] font-medium ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top selling wallpapers */}
          <div className="lg:col-span-2 rounded-[4px] border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[var(--text-muted)]" />
              <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Top Selling Wallpapers</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {topWallpapers.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-[var(--text-muted)]">No sales yet</p>
              ) : topWallpapers.map((t, i) => {
                const w = topWallpaperMap[t.wallpaperId]
                if (!w) return null
                return (
                  <div key={t.wallpaperId} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-xs text-[var(--text-muted)] w-4 shrink-0">{i + 1}</span>
                    <div className="relative h-10 w-7 shrink-0 rounded-[3px] overflow-hidden">
                      <Image src={w.thumbPath} alt={w.title} fill className="object-cover" sizes="28px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text)] truncate">{w.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{w.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[var(--accent)]">₹{(t._sum.amount ?? 0).toFixed(0)}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{t._count.wallpaperId} sales</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue by category */}
          <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-[var(--text-muted)]" />
              <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Revenue by Category</h2>
            </div>
            <div className="p-5 space-y-4">
              {categoryRevenue.length === 0 ? (
                <p className="text-sm text-center text-[var(--text-muted)]">No data yet</p>
              ) : categoryRevenue.map(([cat, rev]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--text-muted)]">{cat}</span>
                    <span className="text-[var(--text)]">₹{rev.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${(rev / maxCatRev) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent sales */}
          <div className="lg:col-span-2 rounded-[4px] border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />
              <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Recent Sales</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {recentSales.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-[var(--text-muted)]">No sales yet</p>
              ) : recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative h-10 w-7 shrink-0 rounded-[3px] overflow-hidden">
                    <Image src={sale.wallpaper.thumbPath} alt={sale.wallpaper.title} fill className="object-cover" sizes="28px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text)] truncate">{sale.wallpaper.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{sale.user.name ?? sale.user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--accent)]">₹{sale.amount.toFixed(0)}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {sale.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most wishlisted */}
          <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-[var(--text-muted)]" />
              <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Most Wishlisted</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {wishlistCounts.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-[var(--text-muted)]">No wishlist data yet</p>
              ) : wishlistCounts.map((w, i) => {
                const wall = wishlistMap[w.wallpaperId]
                if (!wall) return null
                return (
                  <div key={w.wallpaperId} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xs text-[var(--text-muted)] w-4 shrink-0">{i + 1}</span>
                    <div className="relative h-10 w-7 shrink-0 rounded-[3px] overflow-hidden">
                      <Image src={wall.thumbPath} alt={wall.title} fill className="object-cover" sizes="28px" />
                    </div>
                    <p className="flex-1 text-sm text-[var(--text)] truncate min-w-0">{wall.title}</p>
                    <span className="text-xs text-[var(--text-muted)] shrink-0">{w._count.wallpaperId} ♥</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
