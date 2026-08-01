import { NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/auth/csrf'

// Client calls GET /api/auth/csrf on app load to receive a fresh CSRF token cookie.
// The token is also returned in the response body so the client can store it in memory.
export async function GET() {
  const token = await generateCsrfToken()
  return NextResponse.json({ csrfToken: token })
}
