import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { razorpay } from '@/lib/payment/razorpay'

export async function POST() {
  const session = await requireAuth()

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: { wallpaper: { select: { id: true, title: true, price: true } } },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Filter out already-purchased items
  const ownedPurchases = await prisma.purchase.findMany({
    where: { userId: session.id },
    select: { wallpaperId: true },
  })
  const ownedIds = new Set(ownedPurchases.map((p) => p.wallpaperId))

  const billableItems = cartItems.filter((ci) => !ownedIds.has(ci.wallpaperId))

  if (billableItems.length === 0) {
    return NextResponse.json({ error: 'All items already purchased' }, { status: 400 })
  }

  const totalAmount = billableItems.reduce((sum, ci) => sum + ci.wallpaper.price, 0)

  const order = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    receipt: `cart_${session.id.slice(0, 16)}`,
    notes: { userId: session.id, type: 'cart' },
  })

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    itemCount: billableItems.length,
    items: billableItems.map((ci) => ({
      id: ci.wallpaper.id,
      title: ci.wallpaper.title,
      price: ci.wallpaper.price,
    })),
  })
}
