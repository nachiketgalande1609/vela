import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { ids, published } = await req.json() as { ids: string[]; published: boolean }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }

  await prisma.wallpaper.updateMany({ where: { id: { in: ids } }, data: { published } })
  return NextResponse.json({ updated: ids.length })
}
