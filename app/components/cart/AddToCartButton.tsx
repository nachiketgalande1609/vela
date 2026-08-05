'use client'

import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  wallpaperId: string
  isAuthenticated: boolean
  owned?: boolean
  isFree?: boolean
}

export function AddToCartButton({ wallpaperId, isAuthenticated, owned, isFree }: Props) {
  if (owned || isFree) return null

  async function handleClick() {
    if (!isAuthenticated) {
      toast.error('Sign in to add to cart')
      return
    }

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallpaperId }),
    })

    if (res.status === 409) {
      toast.info('Already in cart')
      return
    }

    if (res.ok) {
      toast.success('Added to cart')
      window.dispatchEvent(new Event('cart-updated'))
    } else {
      toast.error('Failed to add to cart')
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Add to cart"
      className="p-1.5 rounded-[4px] bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm text-[var(--text-muted)] hover:text-[var(--text)]"
    >
      <ShoppingCart size={16} />
    </button>
  )
}
