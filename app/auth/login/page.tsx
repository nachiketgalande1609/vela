'use client'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { Button } from '@/app/components/ui/Button'
import { OAuthButtons } from '@/app/components/auth/OAuthButtons'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'

type State = { errors?: Record<string, string[]>; error?: string; ok?: boolean } | null

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

  const data = await res.json()
  if (!res.ok) return { errors: data.errors, error: data.error }
  return { ok: true }
}

const inputClass = (hasError: boolean) =>
  `block w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 transition-all bg-neutral-50
   placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:bg-white
   ${hasError
     ? 'border-red-300 bg-red-50/50 focus:ring-red-400/5 focus:border-red-400'
     : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900/5'}`

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
      router.push('/dashboard')
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <AuthCard title="Sign in to your account" subtitle="Don't have an account? Create one for free.">
      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required
            placeholder="you@example.com" value={fields.email} onChange={set('email')}
            className={inputClass(!!state?.errors?.email)} />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Password</label>
          <div className="relative">
            <input id="password" name="password" type={showPass ? 'text' : 'password'}
              autoComplete="current-password" required placeholder="••••••••"
              value={fields.password} onChange={set('password')}
              className={`${inputClass(!!state?.errors?.password)} pr-10`} />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-neutral-400 hover:text-neutral-700 transition-colors">
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
          {state?.errors?.password && <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="rememberMe" className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer select-none">
            <input id="rememberMe" type="checkbox" name="rememberMe"
              className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900/10 cursor-pointer" />
            Remember me for 30 days
          </label>
          <Link href="/auth/forgot-password" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={pending} className="w-full">Sign in</Button>

        <OAuthButtons />

        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-semibold text-neutral-900 hover:underline">Create one</Link>
        </p>
      </form>
    </AuthCard>
  )
}
