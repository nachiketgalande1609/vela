'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export function CartIcon() {
  const [count, setCount] = useState(0)

  async function fetchCount() {
    try {
      const res = await fetch('/api/cart/count')
      if (res.status === 401) return
      if (res.ok) {
        const data = await res.json()
        setCount(data.count ?? 0)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchCount()
    window.addEventListener('cart-updated', fetchCount)
    return () => window.removeEventListener('cart-updated', fetchCount)
  }, [])

  return (
    <Link href="/cart" className="relative text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
      <ShoppingCart className="h-6 w-6 sm:h-5 sm:w-5" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
