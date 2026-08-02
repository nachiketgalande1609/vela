import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyDownloadToken } from '@/lib/wallpapers/sign-token'
import { streamFileResponse } from '@/lib/wallpapers/stream-file'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new Response('Missing token', { status: 400 })
  }

  const payload = await verifyDownloadToken(token)
  if (!payload || payload.wid !== id) {
    return new Response('Invalid token', { status: 401 })
  }

  const nonceRecord = await prisma.downloadNonce.findUnique({
    where: { nonce: payload.nonce },
  })
  if (!nonceRecord || nonceRecord.usedAt || new Date() > nonceRecord.expiresAt) {
    return new Response('Token expired or already used', { status: 401 })
  }
  if (nonceRecord.userId !== payload.sub || nonceRecord.wallpaperId !== id) {
    return new Response('Token mismatch', { status: 401 })
  }

  await prisma.downloadNonce.update({
    where: { nonce: payload.nonce },
    data: { usedAt: new Date() },
  })

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
    select: { storagePath: true, title: true },
  })
  if (!wallpaper) {
    return new Response('Wallpaper not found', { status: 404 })
  }

  const filename = `vela-${wallpaper.title.toLowerCase().replace(/\s+/g, '-')}.jpg`
  return streamFileResponse(wallpaper.storagePath, filename)
}
