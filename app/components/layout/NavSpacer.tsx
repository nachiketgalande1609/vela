'use client'
import { useEffect, useRef } from 'react'

export function NavSpacer() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const header = document.querySelector<HTMLElement>('header[data-nav]')
      if (header && ref.current) {
        const h = header.getBoundingClientRect().height
        ref.current.style.height = `${h || 57}px`
      }
    }
    update() // run immediately
    // rAF re-measures after fixed elements are fully laid out (Safari fix)
    const raf = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div ref={ref} aria-hidden suppressHydrationWarning />
}
