import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

const COOKIE_NAME = 'csrf_token'

function sign(token: string): string {
  return createHmac('sha256', env.CSRF_SECRET).update(token).digest('hex')
}

export async function generateCsrfToken(): Promise<string> {
  const raw = crypto.randomUUID()
  const signed = `${raw}.${sign(raw)}`

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, signed, {
    httpOnly: false, // must be readable by JS for the double-submit pattern
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return signed
}

// Returns true if the X-CSRF-Token header matches the cookie value
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const headerToken = request.headers.get('x-csrf-token')
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value

  if (!headerToken || !cookieToken || headerToken !== cookieToken) return false

  const [raw, sig] = cookieToken.split('.')
  if (!raw || !sig) return false

  const expected = sign(raw)
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
