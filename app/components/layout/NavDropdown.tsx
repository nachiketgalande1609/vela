'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, CreditCard, LogOut, LayoutDashboard, ShieldCheck, Package, Heart, BarChart2, Receipt } from 'lucide-react'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'

interface Props {
  name: string
  role: 'ADMIN' | 'USER'
}

export function NavDropdown({ name, role }: Props) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const openDropdown = () => { setOpen(true); requestAnimationFrame(() => setVisible(true)) }
  const closeDropdown = () => { setVisible(false); setTimeout(() => setOpen(false), 200) }
  const toggle = () => open ? closeDropdown() : openDropdown()

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  const logout = async () => {
    closeDropdown()
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'x-csrf-token': getCsrfCookie() },
    })
    router.push('/')
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
        onClick={toggle}
        className="cursor-pointer flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 hover:border-[var(--text-muted)]/40 transition-colors"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[10px] font-bold text-[var(--accent)]">
          {initials}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="fixed top-[80px] left-3 right-3 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-48 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl z-50 transition-all duration-200 origin-top"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'scaleY(1) translateY(0)' : 'scaleY(0.95) translateY(-6px)' }}
        >
          {role === 'ADMIN' ? (
            <>
              <Link href="/admin" onClick={() => closeDropdown()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors">
                <ShieldCheck className="h-4 w-4" />
                Overview
              </Link>
              <Link href="/admin/wallpapers" onClick={() => closeDropdown()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                Wallpapers
              </Link>
              <Link href="/admin/packs" onClick={() => closeDropdown()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors">
                <Package className="h-4 w-4" />
                Packs
              </Link>
              <Link href="/admin/analytics" onClick={() => closeDropdown()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors">
                <BarChart2 className="h-4 w-4" />
                Analytics
              </Link>
              <div className="my-1 border-t border-[var(--border)]" />
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => closeDropdown()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors">
                <CreditCard className="h-4 w-4" />
                My Library
              </Link>
              <Link href="/dashboard/wishlist" onClick={() => closeDropdown()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors">
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link href="/orders" onClick={() => closeDropdown()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors">
                <Receipt className="h-4 w-4" />
                My Orders
              </Link>
              <div className="my-1 border-t border-[var(--border)]" />
            </>
          )}
          <button
            onClick={() => void logout()}
            className="cursor-pointer flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
