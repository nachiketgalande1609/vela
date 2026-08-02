import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export const runtime = 'nodejs'

async function upsertSubscriptionFromStripe(sub: Stripe.Subscription, userId?: string) {
  const uid = userId ?? (sub.metadata?.userId as string | undefined)
  if (!uid) return

  await prisma.subscription.upsert({
    where: { stripeSubId: sub.id },
    create: {
      userId: uid,
      stripeSubId: sub.id,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    },
    update: {
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, wallpaperId } = session.metadata ?? {}

        if (session.mode === 'payment' && userId && wallpaperId && session.payment_intent) {
          // Individual wallpaper purchase
          const paymentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent.id

          await prisma.purchase.upsert({
            where: { stripePaymentId: paymentId },
            create: {
              userId,
              wallpaperId,
              stripePaymentId: paymentId,
              amount: (session.amount_total ?? 0) / 100,
            },
            update: {},
          })
        } else if (session.mode === 'subscription' && userId && session.subscription) {
          // Subscription purchase — retrieve full subscription object
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          await upsertSubscriptionFromStripe(sub, userId)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscriptionFromStripe(sub)
        break
      }
    }
  } catch (err) {
    console.error('[stripe-webhook]', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
