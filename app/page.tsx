import Link from 'next/link'
import { Shield, RefreshCw, Mail, Lock, Zap, Users } from 'lucide-react'
import { siteConfig } from '@/config/site'

const features = [
  { icon: Shield, title: 'CSRF Protection', desc: 'Double-submit cookie pattern on every mutation' },
  { icon: RefreshCw, title: 'Token Rotation', desc: 'Access + refresh JWT pair with automatic renewal' },
  { icon: Mail, title: 'Email Verification', desc: 'Nodemailer with customisable HTML templates' },
  { icon: Lock, title: 'Brute-Force Guard', desc: 'Per-IP rate limiting and account lockout' },
  { icon: Zap, title: 'OAuth Ready', desc: 'Google and GitHub sign-in out of the box' },
  { icon: Users, title: 'Role-Based Access', desc: 'USER / ADMIN roles enforced in middleware' },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <header className="border-b border-neutral-200 px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-900">
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-neutral-900">{siteConfig.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register"
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors active:scale-[0.98]">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 shadow-xl shadow-neutral-900/20">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900">
          {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-md text-base text-neutral-500">
          {siteConfig.tagline}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/auth/register"
            className="rounded-xl bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors active:scale-[0.98]">
            Get started
          </Link>
          <Link href="/auth/login"
            className="rounded-xl border border-neutral-200 px-8 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">
            Sign in
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
              <Icon className="mb-3 h-5 w-5 text-neutral-900" />
              <p className="text-sm font-semibold text-neutral-900">{title}</p>
              <p className="mt-1 text-xs text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-neutral-200 py-5 text-center text-xs text-neutral-400">
        {siteConfig.stack}
      </footer>
    </div>
  )
}
