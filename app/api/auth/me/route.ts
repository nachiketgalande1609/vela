import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/dal'
import { getUser } from '@/lib/auth/dal'

export async function GET() {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const user = await getUser(session.id)
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  return NextResponse.json({ user })
}
