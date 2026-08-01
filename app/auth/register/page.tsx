'use client'
import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { Button } from '@/app/components/ui/Button'
import { OAuthButtons } from '@/app/components/auth/OAuthButtons'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'

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

const inputClass = (hasError: boolean) =>
  `block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 shadow-sm
   placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
   ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`

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
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">{state?.message}</p>
          <Link href="/auth/login" className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Back to login
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Create your account" subtitle="Start your journey today.">
      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required
            placeholder="Jane Smith" value={fields.name} onChange={set('name')}
            className={inputClass(!!state?.errors?.name)} />
          {state?.errors?.name && <p className="text-xs text-red-600">{state.errors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@example.com" value={fields.email} onChange={set('email')}
            className={inputClass(!!state?.errors?.email)} />
          {state?.errors?.email && <p className="text-xs text-red-600">{state.errors.email[0]}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input id="password" name="password" type={showPass ? 'text' : 'password'}
              autoComplete="new-password" required placeholder="Min. 8 characters"
              value={fields.password} onChange={set('password')}
              className={`${inputClass(!!state?.errors?.password)} pr-10`} />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400 hover:text-gray-600">
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
          {state?.errors?.password && (
            <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
              {state.errors.password.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword"
            type={showPass ? 'text' : 'password'} autoComplete="new-password" required
            placeholder="Repeat your password" value={fields.confirmPassword} onChange={set('confirmPassword')}
            className={inputClass(!!state?.errors?.confirmPassword)} />
          {state?.errors?.confirmPassword && <p className="text-xs text-red-600">{state.errors.confirmPassword[0]}</p>}
        </div>

        <Button type="submit" loading={pending} className="w-full">Create account</Button>

        <OAuthButtons />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </form>
    </AuthCard>
  )
}
