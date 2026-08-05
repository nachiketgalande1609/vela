import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const { packId } = await req.json()

  if (!packId) return NextResponse.json({ error: 'packId required' }, { status: 400 })

  const alreadyPurchased = await prisma.packPurchase.findUnique({
    where: { userId_packId: { userId: session.id, packId } },
  })
  if (alreadyPurchased) return NextResponse.json({ error: 'Already purchased' }, { status: 409 })

  await prisma.packCartItem.upsert({
    where: { userId_packId: { userId: session.id, packId } },
    create: { userId: session.id, packId },
    update: {},
  })

  return NextResponse.json({ added: true })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth()
  const { packId } = await req.json()

  if (!packId) return NextResponse.json({ error: 'packId required' }, { status: 400 })

  await prisma.packCartItem.deleteMany({ where: { userId: session.id, packId } })

  return NextResponse.json({ removed: true })
}
