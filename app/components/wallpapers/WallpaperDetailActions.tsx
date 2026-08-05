'use client'
import { useState, useEffect } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  wallpaperId: string
  isAuthenticated: boolean
  initialWishlisted?: boolean
  initialInCart?: boolean
  owned?: boolean
  isFree?: boolean
}

export function WallpaperDetailActions({
  wallpaperId,
  isAuthenticated,
  initialWishlisted = false,
  initialInCart = false,
  owned = false,
  isFree = false,
}: Props) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [inCart, setInCart] = useState(initialInCart)

  useEffect(() => { setWishlisted(initialWishlisted) }, [initialWishlisted])
  useEffect(() => { setInCart(initialInCart) }, [initialInCart])

  async function toggleWishlist() {
    if (!isAuthenticated) { toast('Sign in to save wallpapers'); return }
    const prev = wishlisted
    setWishlisted(!prev)
    try {
      const res = await fetch('/api/wishlist', {
        method: prev ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId }),
      })
      if (!res.ok) throw new Error()
      toast.success(prev ? 'Removed from wishlist' : 'Added to wishlist')
    } catch {
      setWishlisted(prev)
      toast.error('Something went wrong')
    }
  }

  async function addToCart() {
    if (!isAuthenticated) { toast.error('Sign in to add to cart'); return }
    if (inCart) { toast('Already in cart'); return }
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallpaperId }),
    })
    if (res.status === 409) { toast('Already in cart'); setInCart(true); return }
    if (res.ok) {
      toast.success('Added to cart')
      setInCart(true)
      window.dispatchEvent(new Event('cart-updated'))
    } else {
      toast.error('Failed to add to cart')
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={toggleWishlist}
        className={`cursor-pointer flex items-center gap-2 flex-1 justify-center rounded-[4px] border px-4 py-2.5 text-sm font-medium transition-colors
          ${wishlisted
            ? 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
      >
        <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
        {wishlisted ? 'Wishlisted' : 'Wishlist'}
      </button>

      {!owned && !isFree && (
        <button
          onClick={addToCart}
          className={`cursor-pointer flex items-center gap-2 flex-1 justify-center rounded-[4px] border px-4 py-2.5 text-sm font-medium transition-colors
            ${inCart
              ? 'border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
            }`}
        >
          <ShoppingCart size={15} />
          {inCart ? 'In Cart' : 'Add to Cart'}
        </button>
      )}
    </div>
  )
}
