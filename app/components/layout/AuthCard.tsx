import Link from 'next/link'
import { siteConfig } from '@/config/site'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="fixed inset-0 bg-[var(--bg)] flex flex-col overflow-hidden z-10">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-3 sm:py-10 min-h-0">

        {/* Logo */}
        <Link href="/" className="mb-3 sm:mb-8 flex flex-col items-center gap-1.5 group shrink-0">
          <span
            className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {siteConfig.name}
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent)]">
            {siteConfig.tagline}
          </span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-[400px] rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-8">
          <div className="mb-3 sm:mb-6">
            <h1
              className="text-xl sm:text-2xl font-bold text-[var(--text)]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

      <footer className="shrink-0 pb-3 sm:pb-4 text-center text-[10px] tracking-wider text-[var(--text-muted)] uppercase">
        {siteConfig.name} · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
