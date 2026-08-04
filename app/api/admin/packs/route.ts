import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  await requireAdmin()
  const packs = await prisma.pack.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, price: true, published: true, createdAt: true,
      _count: { select: { wallpapers: true, purchases: true } },
    },
  })
  return NextResponse.json({ packs })
}

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { title, description, price, wallpaperIds } =
    await req.json() as { title: string; description?: string; price: number; wallpaperIds: string[] }

  if (!title || !Array.isArray(wallpaperIds) || wallpaperIds.length === 0) {
    return NextResponse.json({ error: 'Title and at least one wallpaper required' }, { status: 400 })
  }

  const pack = await prisma.pack.create({
    data: {
      title,
      description: description ?? undefined,
      price: price ?? 250,
      wallpapers: {
        create: wallpaperIds.map((wallpaperId, order) => ({ wallpaperId, order })),
      },
    },
  })
  return NextResponse.json({ pack }, { status: 201 })
}
