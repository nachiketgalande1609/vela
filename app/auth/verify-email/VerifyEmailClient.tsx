'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthCard } from '@/app/components/layout/AuthCard'
import { Button } from '@/app/components/ui/Button'

type Status = 'idle' | 'verifying' | 'success' | 'error'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        setMessage(data.message ?? data.error)
        setStatus(res.ok ? 'success' : 'error')
        if (res.ok) setTimeout(() => router.push('/auth/login'), 3000)
      } catch {
        setMessage('Something went wrong. Please try again.')
        setStatus('error')
      }
    }
    verify()
  }, [token, router])

  return (
    <div className="text-center space-y-6">
      {status === 'verifying' && (
        <>
          <div className="flex justify-center">
            <svg className="h-8 w-8 animate-spin text-[var(--accent)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-muted)]">Verifying your email address…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[4px] border border-[var(--accent)]/30 bg-[var(--surface-2)]">
            <svg className="h-7 w-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text)]">{message}</p>
          <p className="text-xs text-[var(--text-muted)]">Redirecting to sign in…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[4px] border border-red-500/30 bg-[var(--surface-2)]">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-red-400">{message}</p>
          <Link href="/auth/login">
            <Button variant="gold">Back to sign in</Button>
          </Link>
        </>
      )}

      {status === 'idle' && (
        <>
          <p className="text-sm text-[var(--text-muted)]">No verification token found. Check your email for the link.</p>
          <Link href="/auth/login">
            <Button variant="gold">Back to sign in</Button>
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Verify email">
      <Suspense fallback={
        <div className="flex justify-center py-8">
          <svg className="h-5 w-5 animate-spin text-[var(--accent)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  )
}
