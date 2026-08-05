import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) return NextResponse.json({ hasSubscription: false, ownedIds: [] })

    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true } })
    if (user?.role === 'ADMIN') {
      return NextResponse.json({ hasSubscription: true, ownedIds: [] })
    }

    const [purchases, subscription] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId: session.id },
        select: { wallpaperId: true },
      }),
      prisma.subscription.findUnique({
        where: { userId: session.id },
        select: { status: true, currentPeriodEnd: true },
      }),
    ])

    const hasSubscription =
      subscription?.status === 'active' && new Date() < subscription.currentPeriodEnd

    return NextResponse.json({
      hasSubscription,
      ownedIds: purchases.map((p) => p.wallpaperId),
    })
  } catch {
    return NextResponse.json({ hasSubscription: false, ownedIds: [] })
  }
}
