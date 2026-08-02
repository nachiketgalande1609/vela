import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailSchema } from '@/lib/validations/auth'
import { getVerificationToken, deleteVerificationToken } from '@/lib/db/tokens'
import { updateUser } from '@/lib/db/users'

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = verifyEmailSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { token } = parsed.data

  try {
    const record = await getVerificationToken(token)

    if (!record || record.type !== 'EMAIL_VERIFICATION' || new Date() > record.expiresAt) {
      return NextResponse.json({ error: 'Verification link is invalid or has expired.' }, { status: 400 })
    }

    if (record.user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified.' })
    }

    await Promise.all([
      updateUser(record.userId, { emailVerified: new Date() }),
      deleteVerificationToken(record.id),
    ])

    return NextResponse.json({ message: 'Email verified successfully. You can now log in.' })
  } catch (err) {
    console.error('[verify-email]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
