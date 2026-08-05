import Link from 'next/link'

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[#0A0A0A]/80 backdrop-blur-md py-3 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <p>© {new Date().getFullYear()} Vela. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms of Service</Link>
          <Link href="/license" className="hover:text-[var(--text)] transition-colors">Licence</Link>
          <Link href="/refund-policy" className="hover:text-[var(--text)] transition-colors">Refund Policy</Link>
          <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
