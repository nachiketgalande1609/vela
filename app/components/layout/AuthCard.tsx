import Link from 'next/link'
import { siteConfig } from '@/config/site'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 overflow-y-auto">

        {/* Logo */}
        <Link href="/" className="mb-8 flex flex-col items-center gap-2 group shrink-0">
          <span
            className="text-2xl font-bold tracking-tight text-[var(--text)]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {siteConfig.name}
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent)]">
            {siteConfig.tagline}
          </span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-[400px] rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="mb-6">
            <h1
              className="text-2xl font-bold text-[var(--text)]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

      <footer className="shrink-0 pb-4 text-center text-[10px] tracking-wider text-[var(--text-muted)] uppercase">
        {siteConfig.name} · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
