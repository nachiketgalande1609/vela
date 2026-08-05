export const dynamic = 'force-dynamic'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { OrdersClient } from './OrdersClient'

export const metadata = { title: 'My Orders — Vela' }

export default async function OrdersPage() {
  const session = await requireAuth()

  const [purchases, packPurchases, subscription] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.id, NOT: { paymentId: { startsWith: 'sub_download_' } } },
      include: { wallpaper: { select: { id: true, title: true, thumbPath: true, category: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.packPurchase.findMany({
      where: { userId: session.id },
      include: { pack: { select: { id: true, title: true, price: true, _count: { select: { wallpapers: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.id },
      select: { subscriptionId: true, status: true, currentPeriodEnd: true, createdAt: true },
    }),
  ])

  // Group wallpaper purchases by base payment ID (format: pay_xxx_w_wallpaperId)
  const orderMap = new Map<string, {
    paymentId: string
    createdAt: Date
    wallpapers: typeof purchases
    packs: typeof packPurchases
    total: number
  }>()

  for (const p of purchases) {
    const baseId = p.paymentId.includes('_w_') ? p.paymentId.split('_w_')[0] : p.paymentId
    if (!orderMap.has(baseId)) {
      orderMap.set(baseId, { paymentId: baseId, createdAt: p.createdAt, wallpapers: [], packs: [], total: 0 })
    }
    const order = orderMap.get(baseId)!
    order.wallpapers.push(p)
    order.total += p.amount
  }

  for (const p of packPurchases) {
    const baseId = p.paymentId.includes('_p_') ? p.paymentId.split('_p_')[0] : p.paymentId
    if (!orderMap.has(baseId)) {
      orderMap.set(baseId, { paymentId: baseId, createdAt: p.createdAt, wallpapers: [], packs: [], total: 0 })
    }
    const order = orderMap.get(baseId)!
    order.packs.push(p)
    order.total += p.amount
  }

  const orders = Array.from(orderMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
          My Orders
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Your purchase history and invoices</p>
        <OrdersClient orders={orders as any} subscription={subscription as any} />
      </main>
    </div>
  )
}
