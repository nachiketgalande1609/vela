import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { razorpay } from '@/lib/payment/razorpay'
import { env } from '@/lib/env'

export async function POST() {
  const session = await requireAuth()

  const [cartItems, packCartItems, subCartItem] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.id },
      include: { wallpaper: { select: { id: true, title: true, price: true } } },
    }),
    prisma.packCartItem.findMany({
      where: { userId: session.id },
      include: { pack: { select: { id: true, title: true, price: true } } },
    }),
    prisma.subscriptionCartItem.findUnique({ where: { userId: session.id } }),
  ])

  if (cartItems.length === 0 && packCartItems.length === 0 && !subCartItem) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Subscription checkout — uses Razorpay subscription API
  if (subCartItem) {
    if (!env.RAZORPAY_PLAN_ID) {
      return NextResponse.json({ error: 'Subscriptions not configured' }, { status: 503 })
    }
    const existing = await prisma.subscription.findUnique({ where: { userId: session.id } })
    if (existing?.status === 'active' && new Date() < existing.currentPeriodEnd) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
    }
    try {
      const sub = await razorpay.subscriptions.create({
        plan_id: env.RAZORPAY_PLAN_ID,
        total_count: 600,
        quantity: 1,
        notes: { userId: session.id },
      })
      return NextResponse.json({ type: 'subscription', subscriptionId: sub.id })
    } catch {
      return NextResponse.json({ error: 'Payment unavailable. Please try again later.' }, { status: 503 })
    }
  }

  // One-time order checkout (wallpapers + packs)
  const [ownedPurchases, ownedPackPurchases] = await Promise.all([
    prisma.purchase.findMany({ where: { userId: session.id }, select: { wallpaperId: true } }),
    prisma.packPurchase.findMany({ where: { userId: session.id }, select: { packId: true } }),
  ])
  const ownedWallpaperIds = new Set(ownedPurchases.map((p) => p.wallpaperId))
  const ownedPackIds = new Set(ownedPackPurchases.map((p) => p.packId))

  const billableWallpapers = cartItems.filter((ci) => !ownedWallpaperIds.has(ci.wallpaperId))
  const billablePacks = packCartItems.filter((ci) => !ownedPackIds.has(ci.packId))

  if (billableWallpapers.length === 0 && billablePacks.length === 0) {
    return NextResponse.json({ error: 'All items already purchased' }, { status: 400 })
  }

  const totalAmount =
    billableWallpapers.reduce((sum, ci) => sum + ci.wallpaper.price, 0) +
    billablePacks.reduce((sum, ci) => sum + ci.pack.price, 0)

  const order = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    receipt: `cart_${session.id.slice(0, 16)}`,
    notes: { userId: session.id, type: 'cart' },
  })

  return NextResponse.json({
    type: 'order',
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    itemCount: billableWallpapers.length + billablePacks.length,
  })
}
