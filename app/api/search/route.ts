import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  if (!q) {
    return NextResponse.json({ wallpapers: [], total: 0, page: 1, pages: 0 })
  }

  const limit = 12
  const skip = (page - 1) * limit

  const where = {
    published: true,
    OR: [
      { title: { contains: q } },
      { tags: { contains: q } },
      { category: { contains: q } },
    ],
  }

  const [wallpapers, total] = await Promise.all([
    prisma.wallpaper.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        category: true,
        thumbPath: true,
        isFree: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wallpaper.count({ where }),
  ])

  return NextResponse.json({
    wallpapers,
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
