'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const Ctx = createContext<{ startLoading: () => void }>({ startLoading: () => {} })

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setLoading(false)
  }, [pathname])

  return (
    <Ctx.Provider value={{ startLoading: () => setLoading(true) }}>
      {children}
      {loading && (
        <>
          <div className="fixed inset-0 z-[100] bg-[var(--bg)]/70 backdrop-blur-sm" style={{ WebkitBackdropFilter: 'blur(4px)' }} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none">
            <div className="h-9 w-9 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" style={{ willChange: 'transform' }} />
          </div>
        </>
      )}
    </Ctx.Provider>
  )
}

export function useNavigationLoading() {
  return useContext(Ctx)
}
