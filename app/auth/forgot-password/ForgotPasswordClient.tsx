'use client'
import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { Button } from '@/app/components/ui/Button'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'
import { authInputClass } from '@/app/components/auth/authInputClass'

type State = { errors?: Record<string, string[]>; message?: string; error?: string } | null

async function forgotAction(_prev: State, formData: FormData): Promise<State> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfCookie() },
    body: JSON.stringify({ email: formData.get('email') }),
  })
  const data = await res.json()
  if (!res.ok) return { errors: data.errors, error: data.error }
  return { message: data.message }
}

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotAction, null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (state?.message) { toast.success(state.message); setSent(true) }
    else if (state?.error) toast.error(state.error)
  }, [state])

  if (sent) {
    return (
      <AuthCard title="Check your inbox">
        <div className="text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[4px] border border-[var(--accent)]/30 bg-[var(--surface-2)]">
            <svg className="h-7 w-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
    <AuthCard title="Reset password" subtitle="Enter your email and we'll send a reset link if an account exists.">
      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)]">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@example.com"
            className={authInputClass(!!state?.errors?.email)} />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-400">{state.errors.email[0]}</p>}
        </div>

        <Button type="submit" variant="gold" loading={pending} className="w-full">
          Send reset link
        </Button>

        <p className="text-center text-sm text-[var(--text-muted)]">
          Remembered it?{' '}
          <Link href="/auth/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
