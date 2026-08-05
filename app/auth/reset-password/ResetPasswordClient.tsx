'use client'
import { Suspense } from 'react'
import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { Button } from '@/app/components/ui/Button'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'
import { authInputClass } from '@/app/components/auth/authInputClass'

type State = { errors?: Record<string, string[]>; message?: string; error?: string } | null

function makeResetAction(token: string) {
  return async function resetAction(_prev: State, formData: FormData): Promise<State> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfCookie() },
      body: JSON.stringify({
        token,
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
      }),
    })
    const data = await res.json()
    if (!res.ok) return { errors: data.errors, error: data.error }
    return { message: data.message }
  }
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [showPass, setShowPass] = useState(false)
  const [state, action, pending] = useActionState(makeResetAction(token), null)

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message)
      setTimeout(() => router.push('/auth/login'), 2000)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  if (!token) {
    return (
      <div className="text-center space-y-5">
        <p className="text-sm text-[var(--text-muted)]">This reset link is invalid. Please request a new one.</p>
        <Link href="/auth/forgot-password">
          <Button variant="gold">Request new link</Button>
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-[var(--text-muted)]">
          New password
        </label>
        <div className="relative">
          <input id="password" name="password" type={showPass ? 'text' : 'password'}
            autoComplete="new-password" required placeholder="Min. 8 characters"
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

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-muted)]">
          Confirm password
        </label>
        <input id="confirmPassword" name="confirmPassword"
          type={showPass ? 'text' : 'password'} autoComplete="new-password" required
          placeholder="Repeat password"
          className={authInputClass(!!state?.errors?.confirmPassword)} />
        {state?.errors?.confirmPassword && <p className="mt-1 text-xs text-red-400">{state.errors.confirmPassword[0]}</p>}
      </div>

      <Button type="submit" variant="gold" loading={pending} className="w-full">
        Reset password
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Set new password" subtitle="Choose a strong password for your account.">
      <Suspense fallback={
        <div className="flex justify-center py-8">
          <svg className="h-5 w-5 animate-spin text-[var(--accent)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
