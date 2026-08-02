import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production.' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email } = body as { email?: string }
  if (!email) {
    return NextResponse.json({ error: 'email is required.' }, { status: 400 })
  }

  const { prisma } = await import('@/lib/db/prisma')
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: `No user found for ${email}` }, { status: 404 })
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: user.emailVerified ?? new Date() },
  })

  return NextResponse.json({ ok: true, message: `${email} verified.` })
}
