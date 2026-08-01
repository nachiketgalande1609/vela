import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getAccessToken, verifyAccessToken, getRefreshToken, verifyRefreshToken } from './session'
import { prisma } from '@/lib/db/prisma'

export type SessionUser = {
  id: string
  role: string
  emailVerified: Date | null
}

// Memoised per-render so multiple components calling verifySession() only hit JWT once
export const verifySession = cache(async (): Promise<SessionUser | null> => {
  const token = await getAccessToken()
  if (!token) return null

  const payload = await verifyAccessToken(token)
  if (!payload) return null

  return { id: payload.sub, role: payload.role, emailVerified: null }
})

export async function requireAuth(): Promise<SessionUser> {
  const session = await verifySession()
  if (!session) redirect('/auth/login')
  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') redirect('/dashboard')
  return session
}

// Full DB lookup — use sparingly (only when you need non-JWT data)
export async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

// Resolve a refresh-token cookie to the underlying session row
export async function resolveRefreshSession() {
  const token = await getRefreshToken()
  if (!token) return null

  const payload = await verifyRefreshToken(token)
  if (!payload) return null

  const session = await prisma.session.findUnique({
    where: { refreshToken: token },
    include: { user: { select: { id: true, role: true, emailVerified: true, lockedUntil: true } } },
  })

  if (!session || new Date() > session.expiresAt) return null
  if (session.user.lockedUntil && new Date() < session.user.lockedUntil) return null

  return { session, user: session.user }
}
