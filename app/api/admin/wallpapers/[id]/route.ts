import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { deleteManyFromS3, s3KeyFromUrl } from '@/lib/storage/s3'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const body = await req.json() as {
    published?: boolean
    title?: string
    price?: number
    category?: string
    tags?: string
    description?: string
  }

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

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
    select: { storagePath: true, thumbPath: true, previewPath: true },
  })

  await prisma.purchase.deleteMany({ where: { wallpaperId: id } })
  await prisma.wallpaper.delete({ where: { id } })

  if (wallpaper) {
    const keys = [
      wallpaper.storagePath,
      s3KeyFromUrl(wallpaper.thumbPath),
      s3KeyFromUrl(wallpaper.previewPath),
    ].filter(Boolean)
    await deleteManyFromS3(keys).catch(() => {}) // non-fatal
  }

  return NextResponse.json({ deleted: true })
}
