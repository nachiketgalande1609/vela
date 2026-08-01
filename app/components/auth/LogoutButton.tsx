'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, MonitorX } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'
import { Button } from '@/app/components/ui/Button'

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: { 'x-csrf-token': getCsrfCookie() } })
      toast.success('Logged out.')
      router.push('/auth/login')
    } catch {
      toast.error('Logout failed.')
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" onClick={handleLogout} loading={loading} className={className}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  )
}

export function LogoutAllButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogoutAll = async () => {
    if (!confirm('This will sign you out of all devices. Continue?')) return
    setLoading(true)
    try {
      await fetch('/api/auth/logout-all', { method: 'POST', headers: { 'x-csrf-token': getCsrfCookie() } })
      toast.success('All sessions revoked.')
      router.push('/auth/login')
    } catch {
      toast.error('Failed to revoke sessions.')
      setLoading(false)
    }
  }

  return (
    <Button variant="danger" onClick={handleLogoutAll} loading={loading}>
      <MonitorX className="mr-2 h-4 w-4" />
      Sign out of all devices
    </Button>
  )
}
