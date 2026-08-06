'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Infinity } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

type WallpaperSnippet = {
  id: string; title: string; price: number; category: string
  thumbPath: string; isFree: boolean; previewPath: string
}

type CartItemType = { id: string; wallpaperId: string; wallpaper: WallpaperSnippet }

type PackSnippet = {
  id: string; title: string; price: number
  _count: { wallpapers: number }
  wallpapers: { wallpaper: { thumbPath: string } }[]
}

type PackCartItemType = { id: string; packId: string; pack: PackSnippet }

interface Props {
  items: CartItemType[]
  packItems: PackCartItemType[]
  hasSubscriptionInCart: boolean
  ownedIds: string[]
  ownedPackIds: string[]
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

export function CartClient({ items: initialItems, packItems: initialPackItems, hasSubscriptionInCart: initialSubInCart, ownedIds, ownedPackIds }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [packItems, setPackItems] = useState(initialPackItems)
  const [subInCart, setSubInCart] = useState(initialSubInCart)
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

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

  async function removePackItem(packId: string) {
    const res = await fetch('/api/pack-cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId }),
    })
    if (res.ok) {
      setPackItems((prev) => prev.filter((i) => i.packId !== packId))
      window.dispatchEvent(new Event('cart-updated'))
    }
  }

  const billableItems = items.filter((i) => !ownedIds.includes(i.wallpaperId))
  const billablePackItems = packItems.filter((i) => !ownedPackIds.includes(i.packId))
  // If Vela+ is in cart, wallpapers/packs are covered — don't add their price
  const wallpaperPackTotal = subInCart ? 0
    : billableItems.reduce((sum, i) => sum + i.wallpaper.price, 0)
      + billablePackItems.reduce((sum, i) => sum + i.pack.price, 0)
  const subtotal = wallpaperPackTotal + (subInCart ? 199 : 0)
  const totalCount = billableItems.length + billablePackItems.length + (subInCart ? 1 : 0)

  async function handleCheckout() {
    setLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { toast.error('Failed to load payment gateway'); return }

      const res = await fetch('/api/cart/checkout', { method: 'POST' })
      if (!res.ok) {
        const { error } = await res.json()
        toast.error(error ?? 'Checkout failed')
        return
      }
      const data = await res.json()

      if (data.type === 'subscription') {
        // Razorpay subscription flow
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          subscription_id: data.subscriptionId,
          name: 'Vela',
          description: 'Vela+ Monthly Subscription',
          theme: { color: '#C8A97E' },
          handler: async (response: any) => {
            // Clear cart immediately for instant visual feedback
            setSubInCart(false)
            setItems([])
            setPackItems([])
            setProcessingPayment(true)
            window.dispatchEvent(new Event('cart-updated'))
            const vRes = await fetch('/api/subscriptions/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            })
            if (vRes.ok) {
              router.push('/order-confirmation?type=subscription')
            } else {
              setProcessingPayment(false)
              toast.error('Payment verification failed')
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        })
        rzp.open()
      } else {
        // One-time order flow
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: data.orderId,
          amount: data.amount,
          currency: data.currency,
          name: 'Vela',
          theme: { color: '#C8A97E' },
          handler: async (response: any) => {
            // Clear cart immediately for instant visual feedback
            setItems([])
            setPackItems([])
            setProcessingPayment(true)
            window.dispatchEvent(new Event('cart-updated'))
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
              const vData = await vRes.json()
              router.push(`/order-confirmation?type=order&pid=${vData.paymentId}&total=${vData.total}&count=${vData.purchased}`)
            } else {
              setProcessingPayment(false)
              toast.error('Payment verification failed')
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        })
        rzp.open()
      }
    } finally {
      setLoading(false)
    }
  }

  if (processingPayment) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-[var(--text-muted)]">Processing your payment…</p>
      </div>
    )
  }

  if (items.length === 0 && packItems.length === 0 && !subInCart) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-[var(--text-muted)]">Your cart is empty.</p>
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">Browse wallpapers</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[var(--text)]">Your Cart</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">

        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">

          {/* Wallpapers */}
          {items.map((item) => {
            const owned = ownedIds.includes(item.wallpaperId)
            const coveredBySub = subInCart && !owned
            return (
              <div key={item.id} className={`flex items-center gap-4 rounded-[4px] border bg-[var(--card)] p-3 ${coveredBySub ? 'border-[var(--border)] opacity-60' : 'border-[var(--border)]'}`}>
                <div className="relative h-20 w-[45px] flex-shrink-0 overflow-hidden rounded-[4px]">
                  <Image src={item.wallpaper.thumbPath} alt={item.wallpaper.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text)]">{item.wallpaper.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.wallpaper.category}</p>
                  {coveredBySub
                    ? <p className="mt-1 text-xs text-[var(--accent)]">Included with Vela+</p>
                    : <p className="mt-1 text-sm font-semibold text-[var(--accent)]">₹{item.wallpaper.price.toFixed(0)}</p>
                  }
                </div>
                {owned && (
                  <span className="rounded-[4px] bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-400">Owned</span>
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

          {/* Subscription */}
          {subInCart && (
            <div className="flex items-center gap-4 rounded-[4px] border border-[var(--accent)]/30 bg-[var(--surface)] p-3">
              <div className="flex h-20 w-[45px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--accent)]/10">
                <Infinity className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Vela+</p>
                <p className="text-xs text-[var(--text-muted)]">Vela+ · Unlimited wallpapers</p>
                <p className="mt-1 text-sm font-semibold text-[var(--accent)]">₹199 / month</p>
              </div>
              <button
                onClick={async () => {
                  const res = await fetch('/api/subscription-cart', { method: 'DELETE' })
                  if (res.ok) { setSubInCart(false); window.dispatchEvent(new Event('cart-updated')) }
                }}
                aria-label="Remove"
                className="ml-2 rounded-[4px] p-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Packs */}
          {packItems.map((item) => {
            const owned = ownedPackIds.includes(item.packId)
            const coveredBySub = subInCart && !owned
            const thumb = item.pack.wallpapers[0]?.wallpaper.thumbPath
            return (
              <div key={item.id} className={`flex items-center gap-4 rounded-[4px] border bg-[var(--card)] p-3 ${coveredBySub ? 'border-[var(--border)] opacity-60' : 'border-[var(--border)]'}`}>
                <div className="relative h-20 w-[45px] flex-shrink-0 overflow-hidden rounded-[4px]">
                  {thumb ? (
                    <Image src={thumb} alt={item.pack.title} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[var(--surface-2)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text)]">{item.pack.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.pack._count.wallpapers} wallpapers · Pack</p>
                  {coveredBySub
                    ? <p className="mt-1 text-xs text-[var(--accent)]">Included with Vela+</p>
                    : <p className="mt-1 text-sm font-semibold text-[var(--accent)]">₹{item.pack.price.toFixed(0)}</p>
                  }
                </div>
                {owned && (
                  <span className="rounded-[4px] bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-400">Owned</span>
                )}
                <button
                  onClick={() => removePackItem(item.packId)}
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
        <div className="lg:col-span-1 rounded-[4px] border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 lg:sticky lg:top-24">
          <h2 className="text-base font-semibold text-[var(--text)]">Order Summary</h2>
          {subInCart && (items.length > 0 || packItems.length > 0) && (
            <p className="text-[10px] text-[var(--accent)] bg-[var(--accent)]/10 rounded-[4px] px-2 py-1.5">
              Vela+ includes all wallpapers & packs — individual items are covered.
            </p>
          )}
          <div className="flex justify-between text-sm text-[var(--text-muted)]">
            <span>Items ({totalCount})</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="border-t border-[var(--border)] pt-3 flex justify-between font-semibold text-[var(--text)]">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading || totalCount === 0}
            className="cursor-pointer w-full rounded-[4px] bg-[var(--accent)] py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Processing…' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}
