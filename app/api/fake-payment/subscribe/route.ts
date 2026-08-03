import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

// TEST ONLY — skips Razorpay and records an active subscription directly in the DB
export async function POST() {
  const session = await requireAuth()

  const currentPeriodEnd = new Date()
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)

  await prisma.subscription.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      subscriptionId: `fake_sub_${crypto.randomUUID()}`,
      customerId: `fake_cus_${crypto.randomUUID()}`,
      status: 'active',
      currentPeriodEnd,
    },
    update: {
      status: 'active',
      currentPeriodEnd,
    },
  })

  return NextResponse.json({ ok: true })
}
