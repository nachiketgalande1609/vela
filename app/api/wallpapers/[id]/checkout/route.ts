import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  const { id } = await params

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id, published: true },
    select: { id: true, title: true, price: true },
  })
  if (!wallpaper) {
    return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })
  }

  const existing = await prisma.purchase.findUnique({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId: id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 409 })
  }

  const appUrl = env.APP_URL
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(wallpaper.price * 100),
          product_data: { name: wallpaper.title },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: session.id, wallpaperId: id },
    success_url: `${appUrl}/wallpapers/${id}?purchased=true`,
    cancel_url: `${appUrl}/wallpapers/${id}`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
