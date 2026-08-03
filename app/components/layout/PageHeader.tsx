import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Crumb[]
}

export function PageHeader({ title, subtitle, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-3">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-[var(--border)]" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-xs text-[var(--text-muted)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
      )}
    </div>
  )
}
