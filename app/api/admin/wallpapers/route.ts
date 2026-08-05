import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { generatePreviews } from '@/lib/wallpapers/generate-previews'
import { uploadToS3 } from '@/lib/storage/s3'

export async function GET() {
  await requireAdmin()
  const wallpapers = await prisma.wallpaper.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, price: true, category: true,
      published: true, thumbPath: true, createdAt: true,
    },
  })
  return NextResponse.json({ wallpapers })
}

export async function POST(req: NextRequest) {
  await requireAdmin()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const category = formData.get('category') as string
  const tags = formData.get('tags') as string
  const price = parseFloat(formData.get('price') as string)
  const isFree = formData.get('isFree') === 'true'

  if (!file || !title || !category || isNaN(price)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const MAX_SIZE = 50 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 })
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const uuid = crypto.randomUUID()
    const storageKey = `wallpapers/${uuid}.${ext}`

    const metadata = await sharp(buffer).metadata()
    const width = metadata.width ?? 1080
    const height = metadata.height ?? 1920

    await uploadToS3(storageKey, buffer, file.type || 'image/jpeg', false)

    const { thumbPath, previewPath } = await generatePreviews(buffer, uuid)

    const wallpaper = await prisma.wallpaper.create({
      data: {
        title,
        description: description ?? undefined,
        category,
        tags,
        price,
        isFree,
        storagePath: storageKey,
        previewPath,
        thumbPath,
        width,
        height,
      },
    })

    return NextResponse.json({ wallpaper }, { status: 201 })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
