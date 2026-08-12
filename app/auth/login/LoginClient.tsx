'use client'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { Button } from '@/app/components/ui/Button'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'
import { authInputClass } from '@/app/components/auth/authInputClass'

type State = { errors?: Record<string, string[]>; error?: string; ok?: boolean; role?: string } | null

async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const body = {
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  }
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfCookie() },
    body: JSON.stringify(body),
  })
  const data = await res.json() as { errors?: Record<string, string[]>; error?: string; user?: { role: string } }
  if (!res.ok) return { errors: data.errors, error: data.error }
  return { ok: true, role: data.user?.role }
}

export default function LoginPage() {
  const router = useRouter()
  const [state, action, pending] = useActionState(loginAction, null)
  const [showPass, setShowPass] = useState(false)
  const [fields, setFields] = useState({ email: '', password: '' })

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (state?.ok) {
      toast.success('Welcome back!')
      router.push('/')
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <AuthCard title="Sign in" subtitle="Welcome back — good to see you again.">
      <form action={action} className="space-y-3 sm:space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)]">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@example.com" value={fields.email} onChange={set('email')}
            className={authInputClass(!!state?.errors?.email)} />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-400">{state.errors.email[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-muted)]">
            Password
          </label>
          <div className="relative">
            <input id="password" name="password" type={showPass ? 'text' : 'password'}
              autoComplete="current-password" required placeholder="••••••••"
              value={fields.password} onChange={set('password')}
              className={`${authInputClass(!!state?.errors?.password)} pr-12`} />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
          {state?.errors?.password && <p className="mt-1 text-xs text-red-400">{state.errors.password[0]}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="rememberMe" className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer select-none">
            <input id="rememberMe" type="checkbox" name="rememberMe"
              className="h-3.5 w-3.5 rounded-[2px] border border-[var(--border)] bg-[var(--surface-2)] accent-[var(--accent)] cursor-pointer" />
            Remember me
          </label>
          <Link href="/auth/forgot-password"
            className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="gold" loading={pending} className="w-full">
          Sign in
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <a
          href="/api/auth/oauth/google"
          className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface)] hover:border-[var(--text-muted)]/40 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>

        <p className="text-center text-sm text-[var(--text-muted)]">
          No account?{' '}
          <Link href="/auth/register" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
