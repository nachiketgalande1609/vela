'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, User, ShieldCheck, LogOut, Image } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { getCsrfCookie } from '@/app/components/providers/CsrfProvider'
import { siteConfig } from '@/config/site'

interface SidebarUser {
  name: string | null
  email: string
  role: string
}

const baseNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
]
const adminNav = [
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
  { href: '/admin/wallpapers', label: 'Wallpapers', icon: Image },
]

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase()

  const navItems = user.role === 'ADMIN' ? [...baseNav, ...adminNav] : baseNav

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: { 'x-csrf-token': getCsrfCookie() } })
      toast.success('Logged out.')
      router.push('/auth/login')
    } catch {
      toast.error('Logout failed.')
      setLoggingOut(false)
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-white border-r border-neutral-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-neutral-100 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-900">
          <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-neutral-900">{siteConfig.name}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-neutral-900' : 'text-neutral-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-neutral-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">{user.name ?? 'User'}</p>
            <p className="truncate text-xs text-neutral-400">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} disabled={loggingOut}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-800 disabled:opacity-50">
          <LogOut className="h-4 w-4 shrink-0 text-neutral-400" />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
