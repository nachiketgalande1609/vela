import Link from 'next/link'
import { verifySession, getUser } from '@/lib/auth/dal'
import { siteConfig } from '@/config/site'
import { NavDropdown } from './NavDropdown'

export async function PublicNav() {
  const session = await verifySession()
  const user = session ? await getUser(session.id) : null

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
          {siteConfig.name}
        </Link>

<div className="flex items-center gap-5">
          <Link href="/packs" className="hidden sm:block text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Packs
          </Link>
          {user ? (
            <NavDropdown name={user.name ?? user.email} role={user.role as 'ADMIN' | 'USER'} />
          ) : (
            <Link href="/auth/login"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
