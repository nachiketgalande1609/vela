import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { razorpay } from '@/lib/payment/razorpay'
import { verifySubscriptionPayment } from '@/lib/payment/verify'

export async function POST(req: NextRequest) {
  const session = await requireAuth()

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    await req.json() as { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }

  if (!verifySubscriptionPayment(razorpay_payment_id, razorpay_subscription_id, razorpay_signature)) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  // Fetch subscription details from Razorpay to get period end
  const sub = await razorpay.subscriptions.fetch(razorpay_subscription_id)
  const currentPeriodEnd = new Date((sub.current_end as number) * 1000)

  await Promise.all([
    prisma.subscription.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        subscriptionId: razorpay_subscription_id,
        customerId: (sub.customer_id as string) ?? '',
        status: 'active',
        currentPeriodEnd,
      },
      update: {
        subscriptionId: razorpay_subscription_id,
        status: 'active',
        currentPeriodEnd,
      },
    }),
    // Clear subscription cart item after successful payment
    prisma.subscriptionCartItem.deleteMany({ where: { userId: session.id } }),
  ])

  return NextResponse.json({ ok: true })
}
