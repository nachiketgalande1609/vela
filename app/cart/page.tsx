import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { CartClient } from './CartClient'

export default async function CartPage() {
  const session = await requireAuth()

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: {
      wallpaper: {
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          thumbPath: true,
          previewPath: true,
          isFree: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.id },
    select: { wallpaperId: true },
  })
  const ownedIds = purchases.map((p) => p.wallpaperId)

  return (
    <>
      <PublicNav />
      <main className="w-full mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <CartClient items={cartItems as any} ownedIds={ownedIds} />
      </main>
    </>
  )
}
