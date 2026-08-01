import { NextRequest, NextResponse } from 'next/server'
import { getRefreshToken, clearAuthCookies } from '@/lib/auth/session'
import { deleteSessionByRefreshToken } from '@/lib/db/sessions'
import { validateCsrfToken } from '@/lib/auth/csrf'

export async function POST(req: NextRequest) {
  if (!(await validateCsrfToken(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  const refreshToken = await getRefreshToken()
  if (refreshToken) {
    await deleteSessionByRefreshToken(refreshToken)
  }

  await clearAuthCookies()
  return NextResponse.json({ message: 'Logged out successfully.' })
}
