'use client'
import { useEffect, useRef } from 'react'

export function NavSpacer() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const header = document.querySelector<HTMLElement>('header[data-nav]')
      if (header && ref.current) {
        ref.current.style.height = `${header.getBoundingClientRect().height}px`
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return <div ref={ref} aria-hidden />
}
