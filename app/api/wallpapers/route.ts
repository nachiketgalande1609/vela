import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 12

  const where = {
    published: true,
    ...(category && category !== 'All' ? { category } : {}),
  }

  try {
    const [wallpapers, total] = await Promise.all([
      prisma.wallpaper.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, title: true, price: true, category: true,
          thumbPath: true, tags: true, isFree: true,
        },
      }),
      prisma.wallpaper.count({ where }),
    ])
    return NextResponse.json({ wallpapers, total, page, pages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ wallpapers: [], total: 0, page, pages: 0 }, { status: 200 })
  }
}
