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

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id, published: true },
    select: { id: true, title: true, price: true },
  })
  if (!wallpaper) return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })

  const existing = await prisma.purchase.findUnique({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId: id } },
    select: { id: true },
  })
  if (existing) return NextResponse.json({ error: 'Already purchased' }, { status: 409 })

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(wallpaper.price * 100), // paise
      currency: 'INR',
      receipt: `wp_${id.slice(0, 20)}`,
      notes: { userId: session.id, wallpaperId: id },
    })
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, title: wallpaper.title })
  } catch (err) {
    console.error('Razorpay order error:', err)
    return NextResponse.json({ error: 'Payment unavailable — use the test button or configure Razorpay.' }, { status: 503 })
  }
}
