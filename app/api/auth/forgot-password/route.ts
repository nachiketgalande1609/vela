import { NextRequest, NextResponse } from 'next/server'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { getUserByEmail } from '@/lib/db/users'
import { createVerificationToken } from '@/lib/db/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/auth/rate-limit'
import { validateCsrfToken } from '@/lib/auth/csrf'

export async function POST(req: NextRequest) {
  if (!(await validateCsrfToken(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`forgot-password:${ip}`)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  // Always return 200 to prevent email enumeration
  const { email } = parsed.data
  const user = await getUserByEmail(email)

  if (user && user.emailVerified) {
    const token = await createVerificationToken(user.id, 'PASSWORD_RESET')
    await sendPasswordResetEmail(email, user.name ?? '', token).catch(console.error)
  }

  return NextResponse.json({ message: 'If an account exists for that email, a reset link has been sent.' })
}
