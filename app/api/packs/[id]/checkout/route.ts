import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { razorpay } from '@/lib/payment/razorpay'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  const { id } = await params

  const pack = await prisma.pack.findUnique({
    where: { id, published: true },
    select: { id: true, title: true, price: true },
  })
  if (!pack) return NextResponse.json({ error: 'Pack not found' }, { status: 404 })

  const existing = await prisma.packPurchase.findUnique({
    where: { userId_packId: { userId: session.id, packId: id } },
    select: { id: true },
  })
  if (existing) return NextResponse.json({ error: 'Already purchased' }, { status: 409 })

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(pack.price * 100),
      currency: 'INR',
      receipt: `pk_${id.slice(0, 20)}`,
      notes: { userId: session.id, packId: id },
    })
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, title: pack.title })
  } catch (err) {
    console.error('Razorpay pack order error:', err)
    return NextResponse.json({ error: 'Payment unavailable. Please try again later.' }, { status: 503 })
  }
}
