import 'server-only'
import { prisma } from './prisma'
import type { TokenType } from '@prisma/client'

const TOKEN_TTL_MS = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 60 * 60 * 1000,            // 1 hour
}

export async function createVerificationToken(userId: string, type: TokenType) {
  // Invalidate any existing token of the same type for this user
  await prisma.verificationToken.deleteMany({ where: { userId, type } })

  const token = crypto.randomUUID() + crypto.randomUUID() // 72 random chars
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[type])

  await prisma.verificationToken.create({ data: { userId, token, type, expiresAt } })
  return token
}

export async function getVerificationToken(token: string) {
  return prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  })
}

export async function deleteVerificationToken(id: string) {
  return prisma.verificationToken.delete({ where: { id } }).catch(() => null)
}

export async function deleteUserTokensByType(userId: string, type: TokenType) {
  return prisma.verificationToken.deleteMany({ where: { userId, type } })
}
