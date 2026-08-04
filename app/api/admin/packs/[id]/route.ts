import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const { title, description, price, published, wallpaperIds } =
    await req.json() as { title?: string; description?: string; price?: number; published?: boolean; wallpaperIds?: string[] }

  const pack = await prisma.pack.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(published !== undefined && { published }),
      ...(wallpaperIds && {
        wallpapers: {
          deleteMany: {},
          create: wallpaperIds.map((wallpaperId, order) => ({ wallpaperId, order })),
        },
      }),
    },
  })
  return NextResponse.json({ pack })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  await prisma.packPurchase.deleteMany({ where: { packId: id } })
  await prisma.pack.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
