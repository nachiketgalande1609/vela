import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Proxy (formerly middleware) — Next.js 16 renames this file from middleware.ts to proxy.ts.
// Only do JWT cookie reads here (optimistic checks). Never hit the DB; that kills edge performance.

const ACCESS_KEY = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET ?? '')

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

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const user = await getUserFromCookie(req)

  const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_ROUTES.some((p) => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
