import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const packs = await prisma.pack.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, description: true, price: true,
      wallpapers: {
        take: 4,
        orderBy: { order: 'asc' },
        select: { wallpaper: { select: { thumbPath: true } } },
      },
      _count: { select: { wallpapers: true } },
    },
  })
  return NextResponse.json({ packs })
}
