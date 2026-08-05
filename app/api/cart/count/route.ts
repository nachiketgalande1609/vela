import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [wallpaperCount, packCount, subItem] = await Promise.all([
      prisma.cartItem.count({ where: { userId: session.id } }),
      prisma.packCartItem.count({ where: { userId: session.id } }),
      prisma.subscriptionCartItem.findUnique({ where: { userId: session.id }, select: { id: true } }),
    ])
    return NextResponse.json({ count: wallpaperCount + packCount + (subItem ? 1 : 0) })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
