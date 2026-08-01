import { NextRequest, NextResponse } from 'next/server'
import { parseOAuthState, exchangeGoogleCode, exchangeGithubCode } from '@/lib/auth/oauth'
import { getUserByEmail } from '@/lib/db/users'
import { createSession } from '@/lib/db/sessions'
import { createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth/session'
import { generateCsrfToken } from '@/lib/auth/csrf'
import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = req.cookies.get('oauth_state')?.value

  const appUrl = env.APP_URL

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_state_mismatch`)
  }

  const parsedState = parseOAuthState(state)
  if (!parsedState || parsedState.provider !== provider) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_invalid_state`)
  }

  let oauthData: { accessToken: string; email: string; name: string; sub: string } | null = null

  if (provider === 'google') {
    oauthData = await exchangeGoogleCode(code)
  } else if (provider === 'github') {
    oauthData = await exchangeGithubCode(code)
  }

  if (!oauthData) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_exchange_failed`)
  }

  const { email, name, sub, accessToken: oauthAccessToken } = oauthData

  // Find or create the user
  let user = await getUserByEmail(email)

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        emailVerified: new Date(), // OAuth emails are considered verified
      },
    })
  }

  // Upsert the OAuth account link
  await prisma.oAuthAccount.upsert({
    where: { provider_providerAccountId: { provider, providerAccountId: sub } },
    create: { userId: user.id, provider, providerAccountId: sub, accessToken: oauthAccessToken },
    update: { accessToken: oauthAccessToken },
  })

  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  const session = await createSession(user.id, 'placeholder', expiresAt, req.headers.get('user-agent') ?? undefined, ip)

  const [jwtAccess, jwtRefresh] = await Promise.all([
    createAccessToken(user.id, user.role),
    createRefreshToken(user.id, session.id),
  ])

  await prisma.session.update({ where: { id: session.id }, data: { refreshToken: jwtRefresh } })
  await setAuthCookies(jwtAccess, jwtRefresh)
  await generateCsrfToken()

  const response = NextResponse.redirect(`${appUrl}/dashboard`)
  response.cookies.delete('oauth_state')
  return response
}
