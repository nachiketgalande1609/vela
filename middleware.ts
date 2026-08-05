import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const ACCESS_EXPIRES_SECONDS = 15 * 60
const isProduction = process.env.NODE_ENV === 'production'

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  // Access token still valid — nothing to do
  if (accessToken) {
    try {
      const accessKey = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
      await jwtVerify(accessToken, accessKey, { algorithms: ['HS256'] })
      return NextResponse.next()
    } catch {
      // expired or invalid — fall through to refresh
    }
  }

  // No refresh token — pass through (route handlers will redirect if auth is required)
  if (!refreshToken) return NextResponse.next()

  try {
    const refreshKey = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)
    const { payload } = await jwtVerify(refreshToken, refreshKey, { algorithms: ['HS256'] })
    const userId = payload.sub as string
    const role = (payload.role as string) ?? 'USER'

    const accessKey = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
    const newAccessToken = await new SignJWT({ role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_EXPIRES_SECONDS}s`)
      .setJti(crypto.randomUUID())
      .sign(accessKey)

    const res = NextResponse.next()
    res.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: ACCESS_EXPIRES_SECONDS,
      path: '/',
    })
    return res
  } catch {
    // Refresh token invalid/expired — clear it so the browser stops sending it
    const res = NextResponse.next()
    res.cookies.delete('refresh_token')
    return res
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
