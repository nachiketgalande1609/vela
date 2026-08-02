import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST() {
  const session = await requireAuth()

  if (!env.STRIPE_SUBSCRIPTION_PRICE_ID) {
    return NextResponse.json({ error: 'Subscriptions not configured.' }, { status: 503 })
  }

  // If user already has an active subscription, return a billing portal URL
  const existing = await prisma.subscription.findUnique({ where: { userId: session.id } })
  if (existing?.status === 'active' && new Date() < existing.currentPeriodEnd) {
    if (existing.stripeCustomerId) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: existing.stripeCustomerId,
        return_url: `${env.APP_URL}/dashboard`,
      })
      return NextResponse.json({ url: portal.url })
    }
    return NextResponse.json({ error: 'Already subscribed.' }, { status: 400 })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: env.STRIPE_SUBSCRIPTION_PRICE_ID, quantity: 1 }],
    metadata: { userId: session.id },
    success_url: `${env.APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${env.APP_URL}/`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
