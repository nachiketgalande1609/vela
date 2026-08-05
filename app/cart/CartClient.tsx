'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

type WallpaperSnippet = {
  id: string
  title: string
  price: number
  category: string
  thumbPath: string
  isFree: boolean
  previewPath: string
}

type CartItemType = {
  id: string
  wallpaperId: string
  wallpaper: WallpaperSnippet
}

interface Props {
  items: CartItemType[]
  ownedIds: string[]
}

async function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function CartClient({ items: initialItems, ownedIds }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState(false)

  async function removeItem(wallpaperId: string) {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallpaperId }),
    })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.wallpaperId !== wallpaperId))
      window.dispatchEvent(new Event('cart-updated'))
    }
  }

  const billableItems = items.filter((i) => !ownedIds.includes(i.wallpaperId))
  const subtotal = billableItems.reduce((sum, i) => sum + i.wallpaper.price, 0)

  async function handleCheckout() {
    setLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) {
        toast.error('Failed to load payment gateway')
        return
      }

      const res = await fetch('/api/cart/checkout', { method: 'POST' })
      if (!res.ok) {
        const { error } = await res.json()
        toast.error(error ?? 'Checkout failed')
        return
      }
      const { orderId, amount, currency } = await res.json()

      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount,
        currency,
        name: 'Vela Wallpapers',
        theme: { color: '#C8A97E' },
        handler: async (response: any) => {
          const vRes = await fetch('/api/cart/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          if (vRes.ok) {
            toast.success('Payment successful!')
            window.dispatchEvent(new Event('cart-updated'))
            router.push('/dashboard')
          } else {
            toast.error('Payment verification failed')
          }
        },
      })
      rzp.open()
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-[var(--text-muted)]">Your cart is empty.</p>
        <Link href="/wallpapers" className="text-sm text-[var(--accent)] hover:underline">
          Browse wallpapers
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Items list */}
      <div className="flex-1 lg:w-2/3 space-y-3">
        <h1 className="text-xl font-semibold text-[var(--text)]">Your Cart</h1>
        {items.map((item) => {
          const owned = ownedIds.includes(item.wallpaperId)
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-[4px] border border-[var(--border)] bg-[var(--card)] p-3"
            >
              <div className="relative h-20 w-[60px] flex-shrink-0 overflow-hidden rounded-[4px]">
                <Image
                  src={item.wallpaper.thumbPath}
                  alt={item.wallpaper.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text)]">{item.wallpaper.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.wallpaper.category}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
                  ₹{item.wallpaper.price.toFixed(2)}
                </p>
              </div>
              {owned && (
                <span className="rounded-[4px] bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-400">
                  Owned
                </span>
              )}
              <button
                onClick={() => removeItem(item.wallpaperId)}
                aria-label="Remove"
                className="ml-2 rounded-[4px] p-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Order summary */}
      <div className="lg:w-1/3 rounded-[4px] border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 lg:sticky lg:top-24">
        <h2 className="text-base font-semibold text-[var(--text)]">Order Summary</h2>
        <div className="flex justify-between text-sm text-[var(--text-muted)]">
          <span>Items ({billableItems.length})</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="border-t border-[var(--border)] pt-3 flex justify-between font-semibold text-[var(--text)]">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading || billableItems.length === 0}
          className="w-full rounded-[4px] bg-[var(--accent)] py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Processing…' : 'Checkout'}
        </button>
      </div>
    </div>
  )
}
