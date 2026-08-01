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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-gray-600 text-sm">Verifying your email address…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700 text-sm font-medium">{message}</p>
          <p className="text-gray-500 text-xs">Redirecting you to login…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-700 text-sm">{message}</p>
          <Link href="/auth/login">
            <Button variant="secondary">Back to login</Button>
          </Link>
        </>
      )}

      {status === 'idle' && (
        <>
          <p className="text-gray-600 text-sm">No verification token found. Check your email for the verification link.</p>
          <Link href="/auth/login">
            <Button variant="secondary">Back to login</Button>
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Email Verification">
      <Suspense fallback={<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  )
}
