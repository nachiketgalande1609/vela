import { NextRequest, NextResponse } from 'next/server'
import { verifySession, requireAuth } from '@/lib/auth/dal'
import { deleteAllUserSessions } from '@/lib/db/sessions'
import { clearAuthCookies } from '@/lib/auth/session'
import { validateCsrfToken } from '@/lib/auth/csrf'

export async function POST(req: NextRequest) {
  if (!(await validateCsrfToken(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token.' }, { status: 403 })
  }

  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  await deleteAllUserSessions(session.id)
  await clearAuthCookies()

  return NextResponse.json({ message: 'All sessions revoked.' })
}
