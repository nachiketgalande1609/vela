import 'server-only'
import { prisma } from './prisma'

export async function createSession(
  userId: string,
  refreshToken: string,
  expiresAt: Date,
  userAgent?: string,
  ipAddress?: string,
) {
  return prisma.session.create({
    data: { userId, refreshToken, expiresAt, userAgent, ipAddress },
  })
}

export async function getSessionByRefreshToken(refreshToken: string) {
  return prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  })
}

export async function deleteSession(id: string) {
  return prisma.session.delete({ where: { id } }).catch(() => null)
}

export async function deleteSessionByRefreshToken(refreshToken: string) {
  return prisma.session.delete({ where: { refreshToken } }).catch(() => null)
}

export async function deleteAllUserSessions(userId: string) {
  return prisma.session.deleteMany({ where: { userId } })
}

export async function updateSessionRefreshToken(
  oldToken: string,
  newToken: string,
  expiresAt: Date,
) {
  return prisma.session.update({
    where: { refreshToken: oldToken },
    data: { refreshToken: newToken, expiresAt },
  })
}
