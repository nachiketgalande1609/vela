import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pack = await prisma.pack.findUnique({
    where: { id, published: true },
    select: {
      id: true, title: true, description: true, price: true,
      wallpapers: {
        orderBy: { order: 'asc' },
        select: {
          wallpaper: {
            select: { id: true, title: true, thumbPath: true, previewPath: true, category: true },
          },
        },
      },
      _count: { select: { wallpapers: true } },
    },
  })
  if (!pack) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ pack })
}
