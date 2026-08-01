import { NextRequest, NextResponse } from 'next/server'
import { resolveRefreshSession } from '@/lib/auth/dal'
import { createAccessToken, createRefreshToken, setAuthCookies, getRefreshToken } from '@/lib/auth/session'
import { updateSessionRefreshToken } from '@/lib/db/sessions'

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

// Called automatically by the client when an access-token expires (401 response)
export async function POST(_req: NextRequest) {
  const result = await resolveRefreshSession()
  if (!result) {
    return NextResponse.json({ error: 'Invalid or expired refresh token.' }, { status: 401 })
  }

  const { session, user } = result
  const oldRefreshToken = await getRefreshToken()
  if (!oldRefreshToken) return NextResponse.json({ error: 'Missing refresh token.' }, { status: 401 })

  // Rotate both tokens (refresh token rotation prevents reuse attacks)
  const [newAccessToken, newRefreshToken] = await Promise.all([
    createAccessToken(user.id, user.role),
    createRefreshToken(user.id, session.id),
  ])

  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS)
  await updateSessionRefreshToken(oldRefreshToken, newRefreshToken, expiresAt)
  await setAuthCookies(newAccessToken, newRefreshToken)

  return NextResponse.json({ ok: true })
}
