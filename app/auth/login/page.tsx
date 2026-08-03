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
      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@example.com" value={fields.email} onChange={set('email')}
            className={authInputClass(!!state?.errors?.email)} />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-400">{state.errors.email[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
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
