'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface PurchaseButtonProps {
  wallpaperId: string
  price: number
  isAuthenticated: boolean
}

export function PurchaseButton({ wallpaperId, price, isAuthenticated }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBuy = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/wallpapers/${wallpaperId}/checkout`, { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Checkout failed')
        return
      }

      window.location.href = data.url
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="w-full rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Redirecting…' : isAuthenticated ? `Buy for $${price.toFixed(2)}` : 'Sign in to purchase'}
    </button>
  )
}
