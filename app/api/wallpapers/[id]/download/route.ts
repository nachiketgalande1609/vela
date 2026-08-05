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

  // Download-to-own: record a permanent ₹0 purchase for subscribed users
  // so they retain access after their subscription expires
  if (userId) {
    const wallpaper = await prisma.wallpaper.findUnique({ where: { id }, select: { isFree: true } })
    if (!wallpaper?.isFree) {
      const alreadyOwned = await prisma.purchase.findUnique({
        where: { userId_wallpaperId: { userId, wallpaperId: id } },
      })
      if (!alreadyOwned) {
        try {
          await prisma.purchase.create({
            data: {
              userId,
              wallpaperId: id,
              paymentId: `sub_download_${userId}_${id}_${Date.now()}`,
              amount: 0,
            },
          })
        } catch { /* ignore duplicate race */ }
      }
    }
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
