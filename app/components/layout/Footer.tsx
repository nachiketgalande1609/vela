'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp } from 'lucide-react'

export function Footer() {
  const [expanded, setExpanded] = useState(false)

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[#0A0A0A]/80 backdrop-blur-md">
      {/* Vela V badge */}
      <div className="absolute -top-4 left-6 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[#0A0A0A] shadow-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="Vela" width={18} height={18} />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Mobile expandable links */}
        <div
          className="sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
          style={{ maxHeight: expanded ? '80px' : '0px', opacity: expanded ? 1 : 0 }}
        >
          <div className="flex items-center flex-wrap justify-center gap-x-3 gap-y-0.5 text-[10px] text-[var(--text-muted)] py-2">
            <Link href="/about" className="hover:text-[var(--text)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/license" className="hover:text-[var(--text)] transition-colors">Licence</Link>
            <Link href="/refund-policy" className="hover:text-[var(--text)] transition-colors">Refund</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between py-2.5 text-[10px] sm:text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Vela · AI-generated wallpapers.</p>

          {/* Desktop links — inline */}
          <div className="hidden sm:flex items-center gap-x-5">
            <Link href="/about" className="hover:text-[var(--text)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/license" className="hover:text-[var(--text)] transition-colors">Licence</Link>
            <Link href="/refund-policy" className="hover:text-[var(--text)] transition-colors">Refund</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>

          {/* Mobile chevron toggle */}
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label="Toggle footer links"
            className="sm:hidden text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1"
          >
            <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </footer>
  )
}
