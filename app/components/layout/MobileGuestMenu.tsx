'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, ShoppingCart, LogIn, X } from 'lucide-react'

export function MobileGuestMenu() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const openMenu = () => { setOpen(true); requestAnimationFrame(() => setVisible(true)) }
  const closeMenu = () => { setVisible(false); setTimeout(() => setOpen(false), 200) }
  const toggle = () => (open ? closeMenu() : openMenu())

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  return (
    <div ref={ref} className="relative sm:hidden">
      <button
        onClick={toggle}
        className="cursor-pointer flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        aria-label="Menu"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className="fixed top-[60px] left-3 right-3 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl z-50 transition-all duration-200 origin-top"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'scaleY(1) translateY(0)' : 'scaleY(0.95) translateY(-6px)' }}
        >
          <Link
            href="/cart"
            onClick={closeMenu}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
          </Link>
          <div className="my-1 border-t border-[var(--border)]" />
          <Link
            href="/auth/login"
            onClick={closeMenu}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      )}
    </div>
  )
}
