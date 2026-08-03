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
  wallpaperId: string
  price: number
  isAuthenticated: boolean
}

export function PurchaseButton({ wallpaperId, price, isAuthenticated }: Props) {
  const [loading, setLoading] = useState<'rzp' | 'fake' | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const router = useRouter()

  const handleBuy = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setLoading('rzp')
    try {
      const res = await fetch(`/api/wallpapers/${wallpaperId}/checkout`, { method: 'POST' })
      const data = await res.json() as { orderId?: string; amount?: number; currency?: string; title?: string; error?: string }
      if (res.status === 503) { setUnavailable(true); return }
      if (!res.ok || !data.orderId) { toast.error(data.error ?? 'Checkout failed'); return }

      const loaded = await loadRazorpay()
      if (!loaded) { toast.error('Could not load payment widget'); return }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency ?? 'INR',
        order_id: data.orderId,
        name: 'Vela',
        description: data.title,
        theme: { color: '#C8A97E' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch(`/api/wallpapers/${wallpaperId}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          if (verify.ok) {
            toast.success('Purchase successful!')
            window.location.reload()
          } else {
            toast.error('Payment verification failed')
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      })
      rzp.open()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  const handleFakePay = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setLoading('fake')
    try {
      const res = await fetch('/api/fake-payment/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Fake payment failed'); return }
      toast.success('Purchase recorded! Loading download…')
      window.location.reload()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <button onClick={() => router.push('/auth/login')}
        className="w-full rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors">
        Sign in to purchase
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {unavailable ? (
        <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs text-[var(--text-muted)]">
          Razorpay is not configured yet. Use the test button below.
        </div>
      ) : (
        <button onClick={handleBuy} disabled={!!loading}
          className="w-full rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {loading === 'rzp' ? 'Opening payment…' : `Buy for ₹${price.toFixed(0)}`}
        </button>
      )}
      <button onClick={handleFakePay} disabled={!!loading}
        className="w-full rounded-[4px] border border-dashed border-yellow-500/40 bg-yellow-500/5 text-yellow-400 text-xs font-medium px-5 py-2 hover:bg-yellow-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {loading === 'fake' ? 'Processing…' : '⚡ Test: Fake purchase (skip payment)'}
      </button>
    </div>
  )
}
