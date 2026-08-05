import { prisma } from '@/lib/db/prisma'

export async function canDownload(userId: string | null, wallpaperId: string): Promise<boolean> {
  const wallpaper = await prisma.wallpaper.findUnique({ where: { id: wallpaperId }, select: { isFree: true } })
  if (wallpaper?.isFree) return true
  if (!userId) return false

  const [user, purchase, subscription, packPurchase] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.purchase.findUnique({
      where: { userId_wallpaperId: { userId, wallpaperId } },
      select: { id: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: { status: true, currentPeriodEnd: true },
    }),
    prisma.packPurchase.findFirst({
      where: {
        userId,
        pack: { wallpapers: { some: { wallpaperId } } },
      },
      select: { id: true },
    }),
  ])

  if (user?.role === 'ADMIN') return true
  if (purchase) return true
  if (subscription?.status === 'active' && new Date() < subscription.currentPeriodEnd) return true
  if (packPurchase) return true

  return false
}
