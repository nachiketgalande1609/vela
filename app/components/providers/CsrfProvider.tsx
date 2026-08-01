'use client'
import { createContext, useContext, useEffect } from 'react'

const CsrfContext = createContext<null>(null)

// Read directly from the cookie at call time — always fresh, multi-tab safe
export function getCsrfCookie(): string {
  if (typeof document === 'undefined') return ''
  return document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1] ?? ''
}

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure the csrf_token cookie is set on first load
    fetch('/api/auth/csrf').catch(() => {})
  }, [])

  return <CsrfContext.Provider value={null}>{children}</CsrfContext.Provider>
}
