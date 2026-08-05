import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function POST() {
  const session = await requireAuth()

  // Don't add if already subscribed
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.id },
    select: { status: true, currentPeriodEnd: true },
  })
  if (sub?.status === 'active' && new Date() < sub.currentPeriodEnd) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
  }

  await prisma.subscriptionCartItem.upsert({
    where: { userId: session.id },
    create: { userId: session.id },
    update: {},
  })

  return NextResponse.json({ added: true })
}

export async function DELETE() {
  const session = await requireAuth()
  await prisma.subscriptionCartItem.deleteMany({ where: { userId: session.id } })
  return NextResponse.json({ removed: true })
}
