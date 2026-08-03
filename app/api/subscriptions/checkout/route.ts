import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { razorpay } from '@/lib/payment/razorpay'
import { env } from '@/lib/env'

export async function POST() {
  const session = await requireAuth()

  if (!env.RAZORPAY_PLAN_ID) {
    return NextResponse.json({ error: 'Subscriptions not configured.' }, { status: 503 })
  }

  // If already active, return existing subscription ID for re-auth
  const existing = await prisma.subscription.findUnique({ where: { userId: session.id } })
  if (existing?.status === 'active' && new Date() < existing.currentPeriodEnd) {
    return NextResponse.json({ subscriptionId: existing.subscriptionId })
  }

  try {
    const sub = await razorpay.subscriptions.create({
      plan_id: env.RAZORPAY_PLAN_ID,
      total_count: 600, // 50 years — effectively perpetual
      quantity: 1,
      notes: { userId: session.id },
    })
    return NextResponse.json({ subscriptionId: sub.id })
  } catch (err) {
    console.error('Razorpay subscription error:', err)
    return NextResponse.json({ error: 'Payment unavailable. Please try again later.' }, { status: 503 })
  }
}
