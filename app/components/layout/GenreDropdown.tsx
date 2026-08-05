'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

export function GenreDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        Browse
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-48 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] shadow-xl py-1 max-h-[60vh] overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/genres/${cat.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
