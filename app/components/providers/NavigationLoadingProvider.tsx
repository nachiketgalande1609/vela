'use client'
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const Ctx = createContext<{ startLoading: () => void }>({ startLoading: () => {} })

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const pathname = usePathname()

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }

  const startLoading = useCallback(() => {
    clearTimers()
    setVisible(true)
    setProgress(20) // instant visible jump
    let current = 20
    const tick = () => {
      current += (85 - current) * 0.06
      setProgress(current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const finishLoading = useCallback(() => {
    clearTimers()
    setProgress(100)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 300)
  }, [])

  // Clear on route change
  useEffect(() => {
    finishLoading()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Intercept anchor clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || anchor.target === '_blank') return
      if (href !== pathname) startLoading()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname, startLoading])

  return (
    <Ctx.Provider value={{ startLoading }}>
      {children}
      {visible && (
        <div
          className="fixed top-0 left-0 z-[200] h-[2px] bg-[var(--accent)] pointer-events-none"
          style={{
            width: `${progress}%`,
            transition: progress === 100 ? 'width 0.15s ease-out, opacity 0.3s ease' : 'width 0.1s linear',
            opacity: progress === 100 ? 0 : 1,
            boxShadow: '0 0 8px var(--accent)',
          }}
        />
      )}
    </Ctx.Provider>
  )
}

export function useNavigationLoading() {
  return useContext(Ctx)
}
