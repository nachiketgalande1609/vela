import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations/auth'
import { getUserByEmail, createUser } from '@/lib/db/users'
import { createVerificationToken } from '@/lib/db/tokens'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/auth/rate-limit'
import { validateCsrfToken } from '@/lib/auth/csrf'

export async function POST(req: NextRequest) {
  // CSRF guard
  if (!(await validateCsrfToken(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`register:${ip}`)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { name, email, password } = parsed.data

  try {
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ message: 'If that email is available, you will receive a verification link shortly.' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await createUser({ name, email, password: hashed })

    const token = await createVerificationToken(user.id, 'EMAIL_VERIFICATION')
    await sendVerificationEmail(email, name, token).catch((err) => {
      console.error('[register] SMTP send failed:', err?.message ?? err)
    })

    return NextResponse.json({ message: 'Account created. Check your email to verify your account.' }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
