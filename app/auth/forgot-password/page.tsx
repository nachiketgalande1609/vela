'use client'
import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { FormField } from '@/app/components/ui/FormField'
import { Button } from '@/app/components/ui/Button'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'

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
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <svg className="h-8 w-8 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-500">{state?.message}</p>
          <Link href="/auth/login" className="inline-block text-sm font-semibold text-neutral-900 hover:underline">
            Back to login
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot your password?" subtitle="Enter your email and we'll send a reset link if an account exists.">
      <form action={action} className="space-y-5">
        <FormField id="email" label="Email address" name="email" type="email"
          autoComplete="email" required placeholder="you@example.com"
          error={state?.errors?.email} />
        <Button type="submit" loading={pending} className="w-full">Send reset link</Button>
        <p className="text-center text-sm text-neutral-500">
          Remembered your password?{' '}
          <Link href="/auth/login" className="font-semibold text-neutral-900 hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthCard>
  )
}
