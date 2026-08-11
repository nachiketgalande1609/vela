import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { CATEGORIES } from '@/lib/categories'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { ids, category } = await req.json() as { ids: string[]; category: string }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  await prisma.wallpaper.updateMany({ where: { id: { in: ids } }, data: { category } })
  return NextResponse.json({ updated: ids.length })
}
