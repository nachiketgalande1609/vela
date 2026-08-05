'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ShoppingCart, Check } from 'lucide-react'

interface Props {
  packId: string
  isAuthenticated: boolean
  initialInCart?: boolean
  className?: string
}

export function AddPackToCartButton({ packId, isAuthenticated, initialInCart = false, className = '' }: Props) {
  const [inCart, setInCart] = useState(initialInCart)
  const router = useRouter()

  useEffect(() => { setInCart(initialInCart) }, [initialInCart])

  const handleClick = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (inCart) { toast('Already in cart'); return }

    const res = await fetch('/api/pack-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId }),
    })

    if (res.status === 409) { setInCart(true); toast('Already in cart'); return }
    if (res.ok) {
      setInCart(true)
      toast.success('Pack added to cart')
      window.dispatchEvent(new Event('cart-updated'))
    } else {
      toast.error('Failed to add to cart')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer flex items-center gap-2 rounded-[4px] px-6 py-2.5 text-sm font-medium transition-colors
        ${inCart
          ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[var(--accent)]'
          : 'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]'
        } ${className}`}
    >
      {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {inCart ? 'Added to Cart' : 'Add Pack to Cart'}
    </button>
  )
}
