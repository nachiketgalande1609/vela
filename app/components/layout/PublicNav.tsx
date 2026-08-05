import Link from 'next/link'
import { Search } from 'lucide-react'
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
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          {/* Left — logo + genre */}
          <div className="flex items-center gap-5 shrink-0">
            <Link href="/" className="text-lg font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {siteConfig.name}
            </Link>
            <GenreDropdown />
            <Link href="/packs" className="hidden sm:block text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              Packs
            </Link>
            <Link href="/wallpapers/free" className="hidden sm:block text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              Free
            </Link>
          </div>

          {/* Center — search bar (desktop only) */}
          <NavSearch />

          {/* Right — mobile search icon, cart, user */}
          <div className="flex items-center gap-4 shrink-0 ml-auto sm:ml-0">
            <Link href="/search" aria-label="Search" className="sm:hidden text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
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
