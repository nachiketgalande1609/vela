import 'server-only'
import { env } from '@/lib/env'

// ── State cookie helpers ──────────────────────────────────────────────────────

export function buildOAuthState(provider: string): string {
  // state = base64(provider + ":" + random) — verified on callback to prevent CSRF
  return Buffer.from(`${provider}:${crypto.randomUUID()}`).toString('base64url')
}

export function parseOAuthState(state: string): { provider: string } | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString()
    const [provider] = decoded.split(':')
    if (!provider) return null
    return { provider }
  } catch {
    return null
  }
}

// ── Google ────────────────────────────────────────────────────────────────────

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: `${env.APP_URL}/api/auth/oauth/callback/google`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    state,
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string
  email: string
  name: string
  sub: string
} | null> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID ?? '',
      client_secret: env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: `${env.APP_URL}/api/auth/oauth/callback/google`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) return null
  const { access_token } = await tokenRes.json()

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!userRes.ok) return null

  const { sub, email, name } = await userRes.json()
  return { accessToken: access_token, email, name, sub }
}

// ── GitHub ────────────────────────────────────────────────────────────────────

export function getGithubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID ?? '',
    redirect_uri: `${env.APP_URL}/api/auth/oauth/callback/github`,
    scope: 'read:user user:email',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export async function exchangeGithubCode(code: string): Promise<{
  accessToken: string
  email: string
  name: string
  sub: string
} | null> {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${env.APP_URL}/api/auth/oauth/callback/github`,
    }),
  })

  if (!tokenRes.ok) return null
  const { access_token } = await tokenRes.json()

  const [userRes, emailsRes] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'AuthTemplate/1.0' },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'AuthTemplate/1.0' },
    }),
  ])

  if (!userRes.ok) return null
  const user = await userRes.json()

  let primaryEmail = user.email
  if (!primaryEmail && emailsRes.ok) {
    const emails: { email: string; primary: boolean; verified: boolean }[] = await emailsRes.json()
    primaryEmail = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email
  }

  if (!primaryEmail) return null
  return { accessToken: access_token, email: primaryEmail, name: user.name ?? user.login, sub: String(user.id) }
}
