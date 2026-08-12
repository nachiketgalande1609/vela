import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { createDownloadToken } from '@/lib/wallpapers/sign-token'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await verifySession()
  const userId = session?.id ?? null

  // Single round-trip: fetch everything needed for access + download-to-own in one shot
  const [wallpaper, user, purchase, subscription, packPurchase] = await Promise.all([
    prisma.wallpaper.findUnique({ where: { id }, select: { isFree: true } }),
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
      : Promise.resolve(null),
    userId
      ? prisma.purchase.findUnique({ where: { userId_wallpaperId: { userId, wallpaperId: id } }, select: { id: true } })
      : Promise.resolve(null),
    userId
      ? prisma.subscription.findUnique({ where: { userId }, select: { status: true, currentPeriodEnd: true } })
      : Promise.resolve(null),
    userId
      ? prisma.packPurchase.findFirst({ where: { userId, pack: { wallpapers: { some: { wallpaperId: id } } } }, select: { id: true } })
      : Promise.resolve(null),
  ])

  const hasActiveSub = subscription?.status === 'active' && new Date() < (subscription.currentPeriodEnd ?? 0)
  const eligible =
    wallpaper?.isFree ||
    user?.role === 'ADMIN' ||
    !!purchase ||
    hasActiveSub ||
    !!packPurchase

  if (!eligible) {
    return NextResponse.json({ error: 'Purchase or subscribe to download.' }, { status: 403 })
  }

  // Download-to-own: log a ₹0 purchase for subscribed users so they retain access after cancellation
  if (userId && !wallpaper?.isFree && !purchase) {
    try {
      await prisma.purchase.create({
        data: { userId, wallpaperId: id, paymentId: `sub_download_${userId}_${id}_${Date.now()}`, amount: 0 },
      })
    } catch { /* ignore duplicate race */ }
  }

  const nonce = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 1000)

  await prisma.downloadNonce.create({
    data: { nonce, userId: userId ?? 'guest', wallpaperId: id, expiresAt },
  })

  const token = await createDownloadToken(userId ?? 'guest', id, nonce)
  return NextResponse.json({ token })
}
