'use client'
import { useRouter } from 'next/navigation'

interface Props {
  isAuthenticated: boolean
  className?: string
}

export function SubscribeButton({ isAuthenticated, className = '' }: Props) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(isAuthenticated ? '/vela-plus' : '/auth/login')}
      className={`cursor-pointer rounded-[4px] border border-[var(--accent)]/40 bg-transparent text-[var(--accent)] font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent)]/10 transition-colors ${className}`}
    >
      Get Vela+ — ₹499 / month
    </button>
  )
}
