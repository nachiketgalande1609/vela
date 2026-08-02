import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { createDownloadToken } from '@/lib/wallpapers/sign-token'
import { canDownload } from '@/lib/wallpapers/can-download'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  const { id } = await params

  const eligible = await canDownload(session.id, id)
  if (!eligible) {
    return NextResponse.json({ error: 'Purchase or subscribe to download.' }, { status: 403 })
  }

  const nonce = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 1000)

  await prisma.downloadNonce.create({
    data: { nonce, userId: session.id, wallpaperId: id, expiresAt },
  })

  const token = await createDownloadToken(session.id, id, nonce)
  return NextResponse.json({ token })
}
