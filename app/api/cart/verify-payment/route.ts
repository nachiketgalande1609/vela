import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { verifyOrderPayment } from '@/lib/payment/verify'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

  const valid = verifyOrderPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const [cartItems, packCartItems] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.id },
      include: { wallpaper: { select: { title: true, price: true } } },
    }),
    prisma.packCartItem.findMany({
      where: { userId: session.id },
      include: { pack: { select: { title: true, price: true } } },
    }),
  ])

  const purchasedItems: { title: string; type: 'wallpaper' | 'pack'; price: number }[] = []

  for (const item of cartItems) {
    const alreadyOwned = await prisma.purchase.findUnique({
      where: { userId_wallpaperId: { userId: session.id, wallpaperId: item.wallpaperId } },
    })
    if (alreadyOwned) continue
    await prisma.purchase.create({
      data: {
        userId: session.id,
        wallpaperId: item.wallpaperId,
        paymentId: `${razorpay_payment_id}_w_${item.wallpaperId}`,
        amount: item.wallpaper.price,
      },
    })
    purchasedItems.push({ title: item.wallpaper.title, type: 'wallpaper', price: item.wallpaper.price })
  }

  for (const item of packCartItems) {
    const alreadyOwned = await prisma.packPurchase.findUnique({
      where: { userId_packId: { userId: session.id, packId: item.packId } },
    })
    if (alreadyOwned) continue
    await prisma.packPurchase.create({
      data: {
        userId: session.id,
        packId: item.packId,
        paymentId: `${razorpay_payment_id}_p_${item.packId}`,
        amount: item.pack.price,
      },
    })
    purchasedItems.push({ title: item.pack.title, type: 'pack', price: item.pack.price })
  }

  await Promise.all([
    prisma.cartItem.deleteMany({ where: { userId: session.id } }),
    prisma.packCartItem.deleteMany({ where: { userId: session.id } }),
  ])

  // Send confirmation email (non-blocking)
  if (purchasedItems.length > 0) {
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { email: true, name: true } })
    if (user) {
      const total = purchasedItems.reduce((sum, i) => sum + i.price, 0)
      sendOrderConfirmationEmail(user.email, user.name ?? '', razorpay_payment_id, purchasedItems, total).catch(() => {})
    }
  }

  const total = purchasedItems.reduce((sum, i) => sum + i.price, 0)
  return NextResponse.json({ ok: true, purchased: purchasedItems.length, items: purchasedItems, total, paymentId: razorpay_payment_id })
}
