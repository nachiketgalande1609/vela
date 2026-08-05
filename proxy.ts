import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

// Proxy (formerly middleware) — Next.js 16 renames this file from middleware.ts to proxy.ts.
// Only do JWT cookie reads here (optimistic checks). Never hit the DB; that kills edge performance.

const ACCESS_KEY = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET ?? '')
const REFRESH_KEY = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET ?? '')
const ACCESS_EXPIRES_SECONDS = 4 * 60 * 60 // 4 hours
const isProduction = process.env.NODE_ENV === 'production'

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/admin']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

async function getUserFromCookie(req: NextRequest): Promise<{ userId: string; role: string } | null> {
  const token = req.cookies.get('access_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, ACCESS_KEY, { algorithms: ['HS256'] })
    return { userId: payload.sub as string, role: payload.role as string }
  } catch {
    return null
  }
}

async function tryRefreshAccessToken(req: NextRequest): Promise<{ user: { userId: string; role: string }; newToken: string } | null> {
  const refreshToken = req.cookies.get('refresh_token')?.value
  if (!refreshToken) return null
  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_KEY, { algorithms: ['HS256'] })
    const userId = payload.sub as string
    const role = (payload.role as string) ?? 'USER'
    const newToken = await new SignJWT({ role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_EXPIRES_SECONDS}s`)
      .setJti(crypto.randomUUID())
      .sign(ACCESS_KEY)
    return { user: { userId, role }, newToken }
  } catch {
    return null
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_ROUTES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  let user = await getUserFromCookie(req)
  let refreshedToken: string | null = null

  // Silently refresh expired access token using refresh token
  if (!user) {
    const refreshed = await tryRefreshAccessToken(req)
    if (refreshed) {
      user = { userId: refreshed.user.userId, role: refreshed.user.role }
      refreshedToken = refreshed.newToken
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !user) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect non-admins away from admin routes
  if (isAdmin && user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  const res = NextResponse.next()

  if (refreshedToken) {
    res.cookies.set('access_token', refreshedToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: ACCESS_EXPIRES_SECONDS,
      path: '/',
    })
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
