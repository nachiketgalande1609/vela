import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

const ACCESS_EXPIRES_SECONDS = 4 * 60 * 60       // 4 hours
const REFRESH_EXPIRES_SECONDS = 7 * 24 * 60 * 60 // 7 days
const REMEMBER_EXPIRES_SECONDS = 30 * 24 * 60 * 60 // 30 days

const accessKey = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
const refreshKey = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

export type AccessTokenPayload = {
  sub: string   // userId
  role: string
  jti: string
}

export type RefreshTokenPayload = {
  sub: string      // userId
  sid: string      // sessionId in DB
  jti: string
}

// ── Token creation ────────────────────────────────────────────────────────────

export async function createAccessToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_EXPIRES_SECONDS}s`)
    .setJti(crypto.randomUUID())
    .sign(accessKey)
}

export async function createRefreshToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_EXPIRES_SECONDS}s`)
    .setJti(crypto.randomUUID())
    .sign(refreshKey)
}

// ── Token verification ────────────────────────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessKey, { algorithms: ['HS256'] })
    return payload as unknown as AccessTokenPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshKey, { algorithms: ['HS256'] })
    return payload as unknown as RefreshTokenPayload
  } catch {
    return null
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

const isProduction = env.NODE_ENV === 'production'

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  rememberMe = false,
) {
  const cookieStore = await cookies()
  const refreshMaxAge = rememberMe ? REMEMBER_EXPIRES_SECONDS : REFRESH_EXPIRES_SECONDS

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: ACCESS_EXPIRES_SECONDS,
    path: '/',
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: refreshMaxAge,
    path: '/',
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('access_token')?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('refresh_token')?.value
}

// ── Session payload ───────────────────────────────────────────────────────────

export async function getCurrentSession(): Promise<AccessTokenPayload | null> {
  const token = await getAccessToken()
  if (!token) return null
  return verifyAccessToken(token)
}
