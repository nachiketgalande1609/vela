'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ShoppingBag, Loader2 } from 'lucide-react'

declare global {
  interface Window { Razorpay: new (opts: unknown) => { open(): void; on(e: string, cb: () => void): void } }
}

async function loadRazorpay(): Promise<boolean> {
  if (typeof window.Razorpay !== 'undefined') return true
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

interface Props {
  packId: string
  price: number
  isAuthenticated: boolean
  className?: string
}

export function BuyPackButton({ packId, price, isAuthenticated, className = '' }: Props) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    setLoading(true)

    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment SDK failed to load'); setLoading(false); return }

    const res = await fetch(`/api/packs/${packId}/checkout`, { method: 'POST' })
    const data = await res.json() as { orderId?: string; amount?: number; currency?: string; title?: string; error?: string }
    if (!res.ok || !data.orderId) {
      toast.error(data.error ?? 'Could not initiate payment')
      setLoading(false)
      return
    }

    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: data.orderId,
      amount: data.amount,
      currency: data.currency ?? 'INR',
      name: 'Vela',
      description: data.title,
      theme: { color: '#C8A97E' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verify = await fetch(`/api/packs/${packId}/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        })
        if (verify.ok) {
          toast.success('Pack unlocked! Redirecting…')
          setLoading(false)
          window.location.reload()
        } else {
          toast.error('Payment verification failed')
          setLoading(false)
        }
      },
    })
    rzp.on('payment.failed', () => { toast.error('Payment failed'); setLoading(false) })
    rzp.on('dismiss' as 'payment.failed', () => setLoading(false))
    rzp.open()
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors cursor-pointer ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
      {loading ? 'Processing…' : `Buy Pack — ₹${price}`}
    </button>
  )
}
