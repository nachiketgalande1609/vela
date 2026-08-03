import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { verifyOrderPayment } from '@/lib/payment/verify'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  const { id } = await params

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json() as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }

  if (!verifyOrderPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id, published: true },
    select: { id: true, price: true },
  })
  if (!wallpaper) return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })

  await prisma.purchase.upsert({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId: id } },
    create: {
      userId: session.id,
      wallpaperId: id,
      paymentId: razorpay_payment_id,
      amount: wallpaper.price,
    },
    update: {},
  })

  return NextResponse.json({ ok: true })
}
