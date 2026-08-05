import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { verifyOrderPayment } from '@/lib/payment/verify'

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  const valid = verifyOrderPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: { wallpaper: { select: { price: true } } },
  })

  let purchased = 0
  for (const item of cartItems) {
    const alreadyOwned = await prisma.purchase.findUnique({
      where: { userId_wallpaperId: { userId: session.id, wallpaperId: item.wallpaperId } },
    })
    if (alreadyOwned) continue

    await prisma.purchase.create({
      data: {
        userId: session.id,
        wallpaperId: item.wallpaperId,
        paymentId: `${razorpay_payment_id}_${item.wallpaperId}`,
        amount: item.wallpaper.price,
      },
    })
    purchased++
  }

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { userId: session.id } })

  return NextResponse.json({ ok: true, purchased })
}
