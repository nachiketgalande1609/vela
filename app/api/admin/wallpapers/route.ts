import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { generatePreviews } from '@/lib/wallpapers/generate-previews'

const PRIVATE_DIR = path.join(process.cwd(), 'private', 'wallpapers')

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

  if (!file || !title || !category || isNaN(price)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const storagePath = filename

  await writeFile(path.join(PRIVATE_DIR, filename), buffer)

  const { thumbPath, previewPath } = await generatePreviews(
    path.join(PRIVATE_DIR, filename),
    storagePath.replace(`.${ext}`, '')
  )

  const wallpaper = await prisma.wallpaper.create({
    data: {
      title,
      description: description ?? undefined,
      category,
      tags,
      price,
      storagePath,
      previewPath,
      thumbPath,
    },
  })

  return NextResponse.json({ wallpaper }, { status: 201 })
}
