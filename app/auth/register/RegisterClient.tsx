'use client'
import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { Button } from '@/app/components/ui/Button'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'
import { authInputClass } from '@/app/components/auth/authInputClass'

type State = { errors?: Record<string, string[]>; error?: string; message?: string } | null

async function registerAction(_prev: State, formData: FormData): Promise<State> {
  const body = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfCookie() },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) return { errors: data.errors, error: data.error }
  return { message: data.message }
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, null)
  const [showPass, setShowPass] = useState(false)
  const [done, setDone] = useState(false)
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (state?.message && !state.error) {
      toast.success(state.message)
      setDone(true)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  if (done) {
    return (
      <AuthCard title="Check your email">
        <div className="text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[4px] border border-[var(--accent)]/30 bg-[var(--surface-2)]">
            <svg className="h-7 w-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{state?.message}</p>
          <Link href="/auth/login"
            className="inline-block text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            Back to sign in →
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Create account" subtitle="Join Vela and start your collection.">
      <form action={action} className="space-y-3 sm:space-y-5">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)]">
            Full name
          </label>
          <input id="name" name="name" type="text" autoComplete="name" required
            placeholder="Jane Smith" value={fields.name} onChange={set('name')}
            className={authInputClass(!!state?.errors?.name)} />
          {state?.errors?.name && <p className="mt-1 text-xs text-red-400">{state.errors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)]">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@example.com" value={fields.email} onChange={set('email')}
            className={authInputClass(!!state?.errors?.email)} />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-400">{state.errors.email[0]}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--text-muted)]">
            Password
          </label>
          <div className="relative">
            <input id="password" name="password" type={showPass ? 'text' : 'password'}
              autoComplete="new-password" required placeholder="Min. 8 characters"
              value={fields.password} onChange={set('password')}
              className={`${authInputClass(!!state?.errors?.password)} pr-12`} />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
          {state?.errors?.password && (
            <ul className="mt-1 text-xs text-red-400 space-y-0.5 list-disc list-inside">
              {state.errors.password.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-muted)]">
            Confirm password
          </label>
          <input id="confirmPassword" name="confirmPassword"
            type={showPass ? 'text' : 'password'} autoComplete="new-password" required
            placeholder="Repeat your password" value={fields.confirmPassword} onChange={set('confirmPassword')}
            className={authInputClass(!!state?.errors?.confirmPassword)} />
          {state?.errors?.confirmPassword && <p className="mt-1 text-xs text-red-400">{state.errors.confirmPassword[0]}</p>}
        </div>

        <Button type="submit" variant="gold" loading={pending} className="w-full">
          Create account
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
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
