import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const body = await req.json() as { published?: boolean; title?: string; price?: number }

  const wallpaper = await prisma.wallpaper.update({
    where: { id },
    data: body,
  })
  return NextResponse.json({ wallpaper })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  await prisma.wallpaper.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
