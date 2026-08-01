import Link from 'next/link'
import { Shield, RefreshCw, Mail, Lock } from 'lucide-react'
import { siteConfig } from '@/config/site'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

const features = [
  { icon: Shield, text: 'CSRF & brute-force protection' },
  { icon: RefreshCw, text: 'JWT rotation with refresh tokens' },
  { icon: Mail, text: 'Email verification flow' },
  { icon: Lock, text: 'Role-based access control' },
]

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between bg-slate-900 px-10 py-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          </div>
          <span className="font-semibold text-white">{siteConfig.name}</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold leading-snug text-white">
            {siteConfig.tagline}
          </h2>
          <p className="mt-3 text-sm text-slate-400">{siteConfig.description}</p>
          <ul className="mt-8 space-y-3.5">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-600">{siteConfig.stack}</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">{siteConfig.name}</span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}
