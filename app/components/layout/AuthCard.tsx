import Link from 'next/link'
import { siteConfig } from '@/config/site'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="h-screen bg-neutral-100 flex flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 overflow-y-auto">
        {/* Logo */}
        <Link href="/" className="mb-6 flex flex-col items-center gap-2.5 group shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 shadow-md transition-transform group-hover:scale-105">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-neutral-900">{siteConfig.name}</span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-[400px] rounded-2xl bg-white p-7 shadow-sm ring-1 ring-neutral-200/80">
          <div className="mb-5">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>

      <footer className="shrink-0 pb-3 text-center text-xs text-neutral-400">
        {siteConfig.stack}
      </footer>
    </div>
  )
}
