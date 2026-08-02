import Link from 'next/link'
import { verifySession } from '@/lib/auth/dal'
import { siteConfig } from '@/config/site'

export async function PublicNav() {
  const session = await verifySession()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
          {siteConfig.name}
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Browse
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard"
              className="rounded-[4px] bg-[var(--surface-2)] border border-[var(--border)] text-sm font-medium text-[var(--text)] px-4 py-2 hover:border-[var(--accent)]/40 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register"
                className="rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-4 py-2 hover:bg-[var(--accent-hover)] transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
