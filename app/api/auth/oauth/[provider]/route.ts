import { NextRequest, NextResponse } from 'next/server'
import { buildOAuthState, getGoogleAuthUrl, getGithubAuthUrl } from '@/lib/auth/oauth'
import { env } from '@/lib/env'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params

  if (provider === 'google') {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Google OAuth is not configured.' }, { status: 501 })
    }
    const state = buildOAuthState('google')
    const response = NextResponse.redirect(getGoogleAuthUrl(state))
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax', // must be lax for OAuth redirect to work
      maxAge: 600,
      path: '/',
    })
    return response
  }

  if (provider === 'github') {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return NextResponse.json({ error: 'GitHub OAuth is not configured.' }, { status: 501 })
    }
    const state = buildOAuthState('github')
    const response = NextResponse.redirect(getGithubAuthUrl(state))
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  }

  return NextResponse.json({ error: 'Unknown provider.' }, { status: 400 })
}
