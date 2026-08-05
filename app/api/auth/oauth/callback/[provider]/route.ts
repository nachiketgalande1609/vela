import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { parseOAuthState, exchangeGoogleCode } from '@/lib/auth/oauth'
import { createSession } from '@/lib/db/sessions'
import { createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth/session'
import { env } from '@/lib/env'

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('oauth_state')?.value

  const fail = (msg: string) =>
    NextResponse.redirect(`${env.APP_URL}/auth/login?error=${encodeURIComponent(msg)}`)

  if (error) return fail('Google sign-in was cancelled.')
  if (!code || !state || !savedState || state !== savedState) return fail('Invalid OAuth state.')

  const parsed = parseOAuthState(state)
  if (!parsed || parsed.provider !== provider) return fail('OAuth state mismatch.')

  let profile: { sub: string; email: string; name: string; accessToken: string } | null = null

  if (provider === 'google') {
    profile = await exchangeGoogleCode(code)
  } else {
    return fail('Unsupported provider.')
  }

  if (!profile) return fail('Failed to fetch profile from Google.')

  try {
    // Find or create user via OAuthAccount
    let user = await prisma.user.findFirst({
      where: { oauthAccounts: { some: { provider, providerAccountId: profile.sub } } },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      // Link to existing email account, or create new user
      const existing = await prisma.user.findUnique({
        where: { email: profile.email },
        select: { id: true, email: true, name: true, role: true },
      })

      if (existing) {
        user = existing
        await prisma.oAuthAccount.create({
          data: { userId: existing.id, provider, providerAccountId: profile.sub, accessToken: profile.accessToken },
        })
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            emailVerified: new Date(),
            oauthAccounts: {
              create: { provider, providerAccountId: profile.sub, accessToken: profile.accessToken },
            },
          },
          select: { id: true, email: true, name: true, role: true },
        })
      }
    }

    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS)
    const session = await createSession(
      user.id,
      'placeholder',
      expiresAt,
      req.headers.get('user-agent') ?? undefined,
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
    )

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(user.id, user.role),
      createRefreshToken(user.id, session.id),
    ])

    await prisma.session.update({ where: { id: session.id }, data: { refreshToken } })
    await setAuthCookies(accessToken, refreshToken, false)

    revalidatePath('/', 'layout')
    const res = NextResponse.redirect(`${env.APP_URL}/`)
    res.cookies.delete('oauth_state')
    return res
  } catch (err) {
    console.error('[oauth-callback]', err)
    return fail('Something went wrong. Please try again.')
  }
}
