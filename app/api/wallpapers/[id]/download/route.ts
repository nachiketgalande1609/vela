import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { createDownloadToken } from '@/lib/wallpapers/sign-token'
import { canDownload } from '@/lib/wallpapers/can-download'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await verifySession()
  const userId = session?.id ?? null

  const eligible = await canDownload(userId, id)
  if (!eligible) {
    return NextResponse.json({ error: 'Purchase or subscribe to download.' }, { status: 403 })
  }

  const nonce = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 1000)

  // For free wallpapers with no session, use a placeholder userId
  await prisma.downloadNonce.create({
    data: { nonce, userId: userId ?? 'guest', wallpaperId: id, expiresAt },
  })

  const token = await createDownloadToken(userId ?? 'guest', id, nonce)
  return NextResponse.json({ token })
}
