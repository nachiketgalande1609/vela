'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, User, CreditCard, LogOut, LayoutDashboard } from 'lucide-react'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'

interface Props {
  name: string
  role: 'ADMIN' | 'USER'
}

export function NavDropdown({ name, role }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const logout = async () => {
    setOpen(false)
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'x-csrf-token': getCsrfCookie() },
    })
    router.push('/auth/login')
    router.refresh()
  }

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--accent)]/40 transition-colors"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[10px] font-bold text-[var(--accent)]">
          {initials}
        </span>
        <span className="hidden sm:inline max-w-[120px] truncate">{name}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl z-50">
          {role === 'ADMIN' ? (
            <>
              <Link
                href="/admin/wallpapers"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="my-1 border-t border-[var(--border)]" />
            </>
          ) : (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Subscription
              </Link>
              <div className="my-1 border-t border-[var(--border)]" />
            </>
          )}
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
