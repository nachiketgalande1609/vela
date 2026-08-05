export const dynamic = 'force-dynamic'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { CartClient } from './CartClient'

export default async function CartPage() {
  const session = await requireAuth()

  const [cartItems, packCartItems, subCartItem, purchases, packPurchases] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.id },
      include: {
        wallpaper: {
          select: { id: true, title: true, price: true, category: true, thumbPath: true, previewPath: true, isFree: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.packCartItem.findMany({
      where: { userId: session.id },
      include: {
        pack: {
          select: {
            id: true, title: true, price: true,
            _count: { select: { wallpapers: true } },
            wallpapers: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { wallpaper: { select: { thumbPath: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscriptionCartItem.findUnique({ where: { userId: session.id } }),
    prisma.purchase.findMany({ where: { userId: session.id }, select: { wallpaperId: true } }),
    prisma.packPurchase.findMany({ where: { userId: session.id }, select: { packId: true } }),
  ])

  return (
    <>
      <PublicNav />
      <main className="w-full mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <CartClient
          items={cartItems as any}
          packItems={packCartItems as any}
          hasSubscriptionInCart={!!subCartItem}
          ownedIds={purchases.map((p) => p.wallpaperId)}
          ownedPackIds={packPurchases.map((p) => p.packId)}
        />
      </main>
    </>
  )
}
