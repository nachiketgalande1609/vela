import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.wishlist.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: {
      wallpaper: {
        select: { id: true, title: true, price: true, category: true, thumbPath: true, isFree: true },
      },
    },
  })

  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wallpaperId } = await request.json()
  if (!wallpaperId) return NextResponse.json({ error: 'wallpaperId required' }, { status: 400 })

  await prisma.wishlist.upsert({
    where: { userId_wallpaperId: { userId: session.id, wallpaperId } },
    create: { userId: session.id, wallpaperId },
    update: {},
  })

  return NextResponse.json({ wishlisted: true })
}

export async function DELETE(request: Request) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wallpaperId } = await request.json()
  if (!wallpaperId) return NextResponse.json({ error: 'wallpaperId required' }, { status: 400 })

  await prisma.wishlist.deleteMany({
    where: { userId: session.id, wallpaperId },
  })

  return NextResponse.json({ wishlisted: false })
}
