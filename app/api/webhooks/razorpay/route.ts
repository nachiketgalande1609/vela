import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyWebhookSignature } from '@/lib/payment/verify'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body) as { event: string; payload: Record<string, unknown> }

  if (event.event === 'payment.captured') {
    const payment = (event.payload.payment as { entity: Record<string, unknown> }).entity
    const notes = payment.notes as Record<string, string> | null
    const userId = notes?.userId
    const wallpaperId = notes?.wallpaperId

    if (userId && wallpaperId) {
      await prisma.purchase.upsert({
        where: { userId_wallpaperId: { userId, wallpaperId } },
        create: {
          userId,
          wallpaperId,
          paymentId: payment.id as string,
          amount: (payment.amount as number) / 100,
        },
        update: {},
      })
    }
  }

  if (event.event === 'subscription.activated' || event.event === 'subscription.charged') {
    const sub = (event.payload.subscription as { entity: Record<string, unknown> }).entity
    const userId = (sub.notes as Record<string, string>)?.userId
    if (!userId) return NextResponse.json({ ok: true })

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        subscriptionId: sub.id as string,
        customerId: (sub.customer_id as string) ?? '',
        status: 'active',
        currentPeriodEnd: new Date((sub.current_end as number) * 1000),
      },
      update: {
        status: 'active',
        currentPeriodEnd: new Date((sub.current_end as number) * 1000),
      },
    })
  }

  if (event.event === 'subscription.cancelled' || event.event === 'subscription.completed') {
    const sub = (event.payload.subscription as { entity: Record<string, unknown> }).entity
    const userId = (sub.notes as Record<string, string>)?.userId
    if (userId) {
      await prisma.subscription.updateMany({
        where: { userId },
        data: { status: 'canceled' },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
