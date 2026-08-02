'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface SubscribeButtonProps {
  isAuthenticated: boolean
  className?: string
}

export function SubscribeButton({ isAuthenticated, className = '' }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions/checkout', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Could not start subscription')
        return
      }

      window.location.href = data.url
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`rounded-[4px] border border-[var(--accent)]/40 bg-transparent text-[var(--accent)] font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading
        ? 'Redirecting…'
        : isAuthenticated
          ? 'Subscribe — $4.99 / month'
          : 'Sign in to subscribe'}
    </button>
  )
}
