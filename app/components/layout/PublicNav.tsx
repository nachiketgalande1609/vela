import Link from 'next/link'
import { Search, Layers } from 'lucide-react'
import { verifySession, getUser } from '@/lib/auth/dal'
import { siteConfig } from '@/config/site'
import { NavDropdown } from './NavDropdown'
import { GenreDropdown } from './GenreDropdown'
import { NavSpacer } from './NavSpacer'
import { CartIcon } from './CartIcon'
import { NavSearch } from './NavSearch'

export async function PublicNav() {
  const session = await verifySession()
  const user = session ? await getUser(session.id) : null

  return (
    <>
      <header
        data-nav
        className="fixed top-0 left-0 right-0 z-30 border-b border-[var(--border)] bg-[#0A0A0A]/75 backdrop-blur-md"
        style={{ WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4 gap-6">
          {/* Left — logo */}
          <Link href="/" className="text-lg font-bold tracking-tight text-[var(--text)] shrink-0" style={{ fontFamily: 'var(--font-playfair)' }}>
            {siteConfig.name}
          </Link>

          {/* Center — search bar (desktop only, fills remaining space) */}
          <NavSearch />

          {/* Right — nav links + cart + user */}
          <div className="flex items-center gap-5 shrink-0 ml-auto">
            <GenreDropdown />
            <Link href="/packs" className="hidden sm:flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <Layers className="h-3.5 w-3.5" />
              Packs
            </Link>
            {/* Mobile search icon */}
            <Link href="/search" aria-label="Search" className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <Search size={18} />
            </Link>
            <CartIcon />
            {user ? (
              <NavDropdown name={user.name ?? user.email} role={user.role as 'ADMIN' | 'USER'} />
            ) : (
              <Link href="/auth/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      <NavSpacer />
    </>
  )
}
