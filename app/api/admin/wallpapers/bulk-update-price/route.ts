import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { ids, price } = await req.json() as { ids: string[]; price: number }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }
  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  await prisma.wallpaper.updateMany({ where: { id: { in: ids } }, data: { price } })
  return NextResponse.json({ updated: ids.length })
}
