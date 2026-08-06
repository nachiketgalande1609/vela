'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Compass, Layers } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

export function GenreDropdown() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [hasAbove, setHasAbove] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Separate open (mounted) from visible (animated in) so exit animation plays
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

  const checkScroll = () => {
    const el = listRef.current
    if (!el) return
    setHasAbove(el.scrollTop > 4)
    setHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4)
  }

  useEffect(() => {
    if (open) setTimeout(checkScroll, 0)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="cursor-pointer flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        <Compass className="h-6 w-6 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Explore</span>
        <ChevronDown className={`hidden sm:block h-6 w-6 sm:h-5 sm:w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="fixed top-[80px] left-3 right-3 sm:absolute sm:top-full sm:left-0 sm:right-auto sm:mt-2 sm:w-48 z-50 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden flex flex-col max-h-[60vh] transition-all duration-200 origin-top"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'scaleY(1) translateY(0)' : 'scaleY(0.95) translateY(-6px)' }}
        >
          {hasAbove && (
            <div className="flex items-center justify-center py-1.5 border-b border-[var(--border)] bg-[var(--surface)] pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[var(--text-muted)] animate-bounce rotate-180" />
            </div>
          )}
          <div ref={listRef} onScroll={checkScroll} className="overflow-y-auto py-1 [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--accent)] [&::-webkit-scrollbar-thumb]:rounded-full">
            <Link
              href="/packs"
              onClick={() => closeDropdown()}
              className="sm:hidden flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)]"
            >
              <Layers className="h-3.5 w-3.5" />
              Packs
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/genres/${cat.toLowerCase()}`}
                onClick={() => closeDropdown()}
                className="block px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="flex items-center justify-center py-1.5 border-t border-[var(--border)] bg-[var(--surface)] pointer-events-none">
              <ChevronDown className="h-4 w-4 text-[var(--text-muted)] animate-bounce" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
