import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/dal'
import { getPresignedUploadUrl } from '@/lib/storage/s3'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { filename, contentType } = await req.json() as { filename: string; contentType: string }

  const ext = (filename.split('.').pop() ?? 'jpg').toLowerCase()
  const uuid = crypto.randomUUID()
  const key = `wallpapers/${uuid}.${ext}`

  const uploadUrl = await getPresignedUploadUrl(key, contentType || 'image/jpeg')
  return NextResponse.json({ uploadUrl, key, uuid })
}
