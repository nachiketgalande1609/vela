import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { generatePreviews } from '@/lib/wallpapers/generate-previews'
import { downloadFromS3 } from '@/lib/storage/s3'

export async function POST(req: NextRequest) {
  await requireAdmin()

  const { key, uuid, title, description, category, tags, price } = await req.json() as {
    key: string
    uuid: string
    title: string
    description?: string
    category: string
    tags: string
    price: number
  }

  if (!key || !uuid || !title || !category || isNaN(price)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const buffer = await downloadFromS3(key)

    const metadata = await sharp(buffer).metadata()
    const width = metadata.width ?? 1080
    const height = metadata.height ?? 1920

    const { thumbPath, previewPath } = await generatePreviews(buffer, uuid)

    const wallpaper = await prisma.wallpaper.create({
      data: {
        title,
        description: description ?? undefined,
        category,
        tags,
        price,
        storagePath: key,
        previewPath,
        thumbPath,
        width,
        height,
      },
    })

    return NextResponse.json({ wallpaper }, { status: 201 })
  } catch (err) {
    console.error('[confirm]', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
