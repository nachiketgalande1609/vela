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
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBuy = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/wallpapers/${wallpaperId}/checkout`, { method: 'POST' })
      const data = await res.json() as { orderId?: string; amount?: number; currency?: string; title?: string; error?: string }
      if (!res.ok || !data.orderId) {
        toast.error(data.error ?? 'Checkout failed')
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
          setLoading(false)
          if (verify.ok) {
            toast.success('Purchase successful!')
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
        className="w-full rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors">
        Sign in to purchase
      </button>
    )
  }

  return (
    <button onClick={handleBuy} disabled={loading}
      className="w-full rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
      {loading ? 'Opening payment…' : `Buy for ₹${price.toFixed(0)}`}
    </button>
  )
}
