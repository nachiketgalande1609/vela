'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface Props {
  isAuthenticated: boolean
  className?: string
}

export function SubscribeButton({ isAuthenticated, className = '' }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions/checkout', { method: 'POST' })
      const data = await res.json() as { subscriptionId?: string; error?: string }
      if (!res.ok || !data.subscriptionId) {
        toast.error(data.error ?? 'Could not start subscription')
        setLoading(false)
        return
      }

      const loaded = await loadRazorpay()
      if (!loaded) {
        toast.error('Could not load payment widget')
        setLoading(false)
        return
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'Vela',
        description: 'Monthly subscription — download all wallpapers',
        theme: { color: '#C8A97E' },
        handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
          const verify = await fetch('/api/subscriptions/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          setLoading(false)
          if (verify.ok) {
            toast.success('Subscription active!')
            window.location.reload()
          } else {
            toast.error('Payment verification failed')
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <button onClick={() => router.push('/auth/login')}
        className={`w-full rounded-[4px] border border-[var(--accent)]/40 bg-transparent text-[var(--accent)] font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent)]/10 transition-colors ${className}`}>
        Sign in to subscribe
      </button>
    )
  }

  return (
    <button onClick={handleSubscribe} disabled={loading}
      className={`w-full rounded-[4px] border border-[var(--accent)]/40 bg-transparent text-[var(--accent)] font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}>
      {loading ? 'Opening payment…' : 'Subscribe — ₹499 / month'}
    </button>
  )
}
