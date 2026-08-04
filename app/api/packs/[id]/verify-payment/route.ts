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

  const pack = await prisma.pack.findUnique({
    where: { id, published: true },
    select: { id: true, price: true },
  })
  if (!pack) return NextResponse.json({ error: 'Pack not found' }, { status: 404 })

  await prisma.packPurchase.upsert({
    where: { userId_packId: { userId: session.id, packId: id } },
    create: { userId: session.id, packId: id, paymentId: razorpay_payment_id, amount: pack.price },
    update: {},
  })

  return NextResponse.json({ ok: true })
}
