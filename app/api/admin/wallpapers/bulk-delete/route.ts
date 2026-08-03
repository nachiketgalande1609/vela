import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { deleteManyFromS3, s3KeyFromUrl } from '@/lib/storage/s3'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { ids } = await req.json() as { ids: string[] }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 })
  }

  const wallpapers = await prisma.wallpaper.findMany({
    where: { id: { in: ids } },
    select: { storagePath: true, thumbPath: true, previewPath: true },
  })

  await prisma.wallpaper.deleteMany({ where: { id: { in: ids } } })

  const keys = wallpapers.flatMap((w) => [
    w.storagePath,
    s3KeyFromUrl(w.thumbPath),
    s3KeyFromUrl(w.previewPath),
  ]).filter(Boolean)

  await deleteManyFromS3(keys).catch(() => {}) // non-fatal

  return NextResponse.json({ deleted: ids.length })
}
