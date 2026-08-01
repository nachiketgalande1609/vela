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
    <div className="flex min-h-screen flex-col bg-slate-900">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-md text-base text-slate-400">
          {siteConfig.tagline}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/auth/register"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-500">
            Get started
          </Link>
          <Link href="/auth/login"
            className="rounded-xl border border-slate-700 px-8 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800">
            Sign in
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-800/50 p-5">
              <Icon className="mb-3 h-5 w-5 text-indigo-400" />
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-slate-800 py-5 text-center text-xs text-slate-600">
        {siteConfig.stack}
      </footer>
    </div>
  )
}
