import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 12

  const where = {
    published: true,
    ...(category && category !== 'All' ? { category } : {}),
  }

  // Resolve current user if authenticated
  let userId: string | null = null
  try {
    const token = await getAccessToken()
    if (token) {
      const payload = await verifyAccessToken(token)
      if (payload) userId = payload.sub
    }
  } catch {}

  try {
    const [wallpapers, total, wishlistItems] = await Promise.all([
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
      userId
        ? prisma.wishlist.findMany({ where: { userId }, select: { wallpaperId: true } })
        : Promise.resolve([]),
    ])

    const wishlistedSet = new Set(wishlistItems.map((w) => w.wallpaperId))
    const result = wallpapers.map((w) => ({ ...w, wishlisted: wishlistedSet.has(w.id) }))

    return NextResponse.json({ wallpapers: result, total, page, pages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ wallpapers: [], total: 0, page, pages: 0 }, { status: 200 })
  }
}
