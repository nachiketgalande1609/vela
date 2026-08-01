import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { getVerificationToken, deleteVerificationToken } from '@/lib/db/tokens'
import { updateUser } from '@/lib/db/users'
import { deleteAllUserSessions } from '@/lib/db/sessions'
import { validateCsrfToken } from '@/lib/auth/csrf'

export async function POST(req: NextRequest) {
  if (!(await validateCsrfToken(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { token, password } = parsed.data
  const record = await getVerificationToken(token)

  if (!record || record.type !== 'PASSWORD_RESET' || new Date() > record.expiresAt) {
    return NextResponse.json({ error: 'Reset link is invalid or has expired.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await Promise.all([
    updateUser(record.userId, { password: hashed }),
    deleteVerificationToken(record.id),
    deleteAllUserSessions(record.userId), // invalidate all sessions after password change
  ])

  return NextResponse.json({ message: 'Password reset successfully. Please log in with your new password.' })
}
