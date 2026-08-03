import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

// TEST ONLY — skips Razorpay and records the purchase directly in the DB
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const { wallpaperId } = await req.json() as { wallpaperId: string }

  if (!wallpaperId) return NextResponse.json({ error: 'wallpaperId required' }, { status: 400 })

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id: wallpaperId, published: true },
    select: { id: true, price: true },
  })
  if (!wallpaper) return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })

  await prisma.purchase.upsert({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId } },
    create: {
      userId: session.id,
      wallpaperId,
      paymentId: `fake_pay_${crypto.randomUUID()}`,
      amount: wallpaper.price,
    },
    update: {},
  })

  return NextResponse.json({ ok: true })
}
