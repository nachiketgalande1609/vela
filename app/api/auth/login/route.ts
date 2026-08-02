import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { loginSchema } from '@/lib/validations/auth'
import { getUserByEmail, incrementFailedLoginAttempts, lockUser, resetLoginAttempts } from '@/lib/db/users'
import { createSession } from '@/lib/db/sessions'
import { createAccessToken, createRefreshToken, setAuthCookies } from '@/lib/auth/session'
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit'
import { validateCsrfToken } from '@/lib/auth/csrf'
import { generateCsrfToken } from '@/lib/auth/csrf'

const BRUTE_FORCE_LOCK_MINUTES = 30
const MAX_FAILED_ATTEMPTS = 5
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  if (!(await validateCsrfToken(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`login:${ip}`)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { email, password, rememberMe } = parsed.data

  try {
    const user = await getUserByEmail(email)

    // Use constant-time compare to prevent user enumeration via timing
    const dummyHash = '$2b$12$invaliddummyhashfortimingprotectionXXXXXXXXXXXXXXXXXX'
    const passwordToCompare = user?.password ?? dummyHash
    const passwordMatch = await bcrypt.compare(password, passwordToCompare)

    if (!user || !passwordMatch) {
      if (user) {
        await incrementFailedLoginAttempts(user.id)
        const newAttempts = user.failedLoginAttempts + 1
        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          const until = new Date(Date.now() + BRUTE_FORCE_LOCK_MINUTES * 60 * 1000)
          await lockUser(user.id, until)
          return NextResponse.json({ error: 'Account locked due to too many failed attempts. Try again in 30 minutes.' }, { status: 423 })
        }
      }
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // Check account lock
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
      return NextResponse.json({ error: `Account is locked. Try again in ${minutesLeft} minutes.` }, { status: 423 })
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email before logging in.', code: 'EMAIL_NOT_VERIFIED' }, { status: 403 })
    }

    // Successful login — reset counters
    await resetLoginAttempts(user.id)
    resetRateLimit(`login:${ip}`)

    const ttl = rememberMe ? REMEMBER_TTL_MS : REFRESH_TTL_MS
    const expiresAt = new Date(Date.now() + ttl)

    const session = await createSession(
      user.id,
      'placeholder',
      expiresAt,
      req.headers.get('user-agent') ?? undefined,
      ip,
    )

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(user.id, user.role),
      createRefreshToken(user.id, session.id),
    ])

    const { prisma } = await import('@/lib/db/prisma')
    await prisma.session.update({ where: { id: session.id }, data: { refreshToken } })

    await setAuthCookies(accessToken, refreshToken, rememberMe)
    await generateCsrfToken()

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
