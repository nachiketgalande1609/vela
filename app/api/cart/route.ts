import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await requireAuth()

  const items = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: {
      wallpaper: {
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          thumbPath: true,
          isFree: true,
          previewPath: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const { wallpaperId } = await req.json()

  if (!wallpaperId) {
    return NextResponse.json({ error: 'wallpaperId required' }, { status: 400 })
  }

  // Check if already purchased
  const existing = await prisma.purchase.findUnique({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 409 })
  }

  // Check if already in cart
  const inCart = await prisma.cartItem.findUnique({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId } },
  })
  if (inCart) {
    return NextResponse.json({ error: 'Already in cart' }, { status: 409 })
  }

  await prisma.cartItem.upsert({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId } },
    create: { userId: session.id, wallpaperId },
    update: {},
  })

  const count = await prisma.cartItem.count({ where: { userId: session.id } })

  return NextResponse.json({ added: true, count })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth()
  const { wallpaperId } = await req.json()

  if (!wallpaperId) {
    return NextResponse.json({ error: 'wallpaperId required' }, { status: 400 })
  }

  await prisma.cartItem.deleteMany({
    where: { userId: session.id, wallpaperId },
  })

  const count = await prisma.cartItem.count({ where: { userId: session.id } })

  return NextResponse.json({ removed: true, count })
}
