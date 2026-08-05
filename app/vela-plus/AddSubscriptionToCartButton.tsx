'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ShoppingCart, Check } from 'lucide-react'

interface Props {
  initialInCart: boolean
}

export function AddSubscriptionToCartButton({ initialInCart }: Props) {
  const [inCart, setInCart] = useState(initialInCart)
  const router = useRouter()

  const handleClick = async () => {
    if (inCart) { router.push('/cart'); return }

    const res = await fetch('/api/subscription-cart', { method: 'POST' })
    if (res.status === 409) {
      toast('You already have an active subscription')
      return
    }
    if (res.ok) {
      setInCart(true)
      toast.success('Vela+ added to cart')
      window.dispatchEvent(new Event('cart-updated'))
    } else {
      toast.error('Failed to add to cart')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer flex items-center justify-center gap-2 w-full rounded-[4px] px-6 py-3 text-base font-semibold transition-colors
        ${inCart
          ? 'border border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]'
          : 'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]'
        }`}
    >
      {inCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
      {inCart ? 'Added to Cart — Go to Cart' : 'Add Vela+ to Cart'}
    </button>
  )
}
