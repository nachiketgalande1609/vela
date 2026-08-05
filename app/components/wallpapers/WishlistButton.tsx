'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'

interface WishlistButtonProps {
  wallpaperId: string
  initialWishlisted?: boolean
  isAuthenticated: boolean
}

export function WishlistButton({ wallpaperId, initialWishlisted = false, isAuthenticated }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast('Sign in to save wallpapers')
      return
    }

    const prev = wishlisted
    setWishlisted(!prev)

    try {
      const res = await fetch('/api/wishlist', {
        method: prev ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaperId }),
      })
      if (!res.ok) throw new Error('Request failed')
    } catch {
      setWishlisted(prev)
      toast.error('Something went wrong')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="p-1.5 rounded-[4px] bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm"
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={wishlisted ? 'text-red-500' : 'text-[var(--text-muted)]'}
        size={16}
        fill={wishlisted ? 'currentColor' : 'none'}
      />
    </button>
  )
}
