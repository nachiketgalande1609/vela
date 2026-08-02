import { prisma } from '@/lib/db/prisma'

export async function canDownload(userId: string, wallpaperId: string): Promise<boolean> {
  const [purchase, subscription] = await Promise.all([
    prisma.purchase.findUnique({
      where: { userId_wallpaperId: { userId, wallpaperId } },
      select: { id: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: { status: true, currentPeriodEnd: true },
    }),
  ])

  if (purchase) return true

  if (
    subscription?.status === 'active' &&
    new Date() < subscription.currentPeriodEnd
  ) {
    return true
  }

  return false
}
