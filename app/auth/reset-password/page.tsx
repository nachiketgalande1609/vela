'use client'
import { Suspense } from 'react'
import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { FormField } from '@/app/components/ui/FormField'
import { Button } from '@/app/components/ui/Button'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'

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

const inputClass = (hasError: boolean) =>
  `block w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 transition-all bg-neutral-50
   placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:bg-white
   ${hasError
     ? 'border-red-300 bg-red-50/50 focus:ring-red-400/5 focus:border-red-400'
     : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900/5'}`

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
      <div className="text-center space-y-4">
        <p className="text-sm text-neutral-500">This password reset link is invalid. Please request a new one.</p>
        <Link href="/auth/forgot-password">
          <Button variant="secondary">Request new link</Button>
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">New password</label>
        <div className="relative">
          <input id="password" name="password" type={showPass ? 'text' : 'password'}
            autoComplete="new-password" required placeholder="Min. 8 characters"
            className={`${inputClass(!!state?.errors?.password)} pr-10`} />
          <button type="button" onClick={() => setShowPass((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-neutral-400 hover:text-neutral-700 transition-colors">
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>
        {state?.errors?.password && (
          <ul className="mt-1 text-xs text-red-500 space-y-0.5 list-disc list-inside">
            {state.errors.password.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
      </div>

      <FormField id="confirmPassword" label="Confirm password" name="confirmPassword"
        type={showPass ? 'text' : 'password'} autoComplete="new-password" required
        placeholder="Repeat password" error={state?.errors?.confirmPassword} />

      <Button type="submit" loading={pending} className="w-full">Reset password</Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Set new password" subtitle="Choose a strong password for your account.">
      <Suspense fallback={<div className="text-center text-sm text-neutral-400">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
