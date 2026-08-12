'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'

interface Wallpaper {
  id: string
  title: string
  thumbPath: string
  category: string
  price: number
  isFree: boolean
  _count: { purchases: number }
}

interface Props {
  wallpapers: Wallpaper[]
}

const CARD_W = 220
const GAP = 12
const STEP = CARD_W + GAP // 232px per step
const SWIPE_THRESHOLD = 50

export function TrendingCarousel({ wallpapers }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [animated, setAnimated] = useState(true)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const prevRef = useRef(0)
  const touchStartXRef = useRef<number | null>(null)
  const dragOffsetRef = useRef(0)

  const goTo = useCallback((idx: number) => {
    const prev = prevRef.current
    const n = wallpapers.length
    const isWrap = (prev === n - 1 && idx === 0) || (prev === 0 && idx === n - 1)
    prevRef.current = idx
    setResetKey((k) => k + 1)

    if (isWrap) {
      setAnimated(false)
      requestAnimationFrame(() => {
        setCurrent(idx)
        requestAnimationFrame(() => setAnimated(true))
      })
    } else {
      setCurrent(idx)
    }
  }, [wallpapers.length])

  const next = useCallback(() => goTo((prevRef.current + 1) % wallpapers.length), [wallpapers.length, goTo])
  const prev = useCallback(() => goTo((prevRef.current - 1 + wallpapers.length) % wallpapers.length), [wallpapers.length, goTo])

  useEffect(() => {
    if (paused || wallpapers.length < 2) return
    const t = setInterval(() => goTo((prevRef.current + 1) % wallpapers.length), 2500)
    return () => clearInterval(t)
  }, [paused, wallpapers.length, resetKey, goTo])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    dragOffsetRef.current = 0
    setIsDragging(true)
    setPaused(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const delta = e.touches[0].clientX - touchStartXRef.current
    dragOffsetRef.current = delta
    setDragOffset(delta)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (touchStartXRef.current === null) return
    const delta = dragOffsetRef.current
    touchStartXRef.current = null
    dragOffsetRef.current = 0

    // Reset drag and re-enable transition in same batch so CSS picks up from drag position
    setIsDragging(false)
    setDragOffset(0)
    setPaused(false)

    if (delta < -SWIPE_THRESHOLD) {
      next()
    } else if (delta > SWIPE_THRESHOLD) {
      prev()
    }
    // If no threshold met, dragOffset snaps back to 0 with transition (rubber-band snap)
  }, [next, prev])

  if (!wallpapers.length) return null

  const trackTransition = isDragging
    ? 'none'
    : animated
      ? 'transform 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none'

  return (
    <section
      className="relative w-full bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--text)]">Trending</span>
            <span className="text-[10px] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-2 py-0.5">Most downloaded</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="h-7 w-7 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} className="h-7 w-7 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sliding track */}
        <div
          className="overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div
            className="flex items-end gap-3"
            style={{
              transform: `translateX(calc(50% - ${CARD_W / 2}px - ${current * STEP}px + ${dragOffset}px))`,
              transition: trackTransition,
            }}
          >
            {wallpapers.map((w, i) => {
              const dist = Math.abs(i - current)
              const circDist = Math.min(dist, wallpapers.length - dist)
              const isCenter = circDist === 0
              const opacity = isCenter ? 1 : circDist === 1 ? 0.4 : 0.2

              return (
                <div
                  key={w.id}
                  style={{ width: CARD_W, aspectRatio: '9/16', flexShrink: 0, opacity, transition: 'opacity 450ms' }}
                  onClick={!isCenter ? (i < current ? prev : next) : undefined}
                  className={!isCenter ? 'cursor-pointer' : ''}
                >
                  {isCenter ? (
                    <Link href={`/wallpapers/${w.id}`} className="group block w-full h-full">
                      <div className="relative w-full h-full rounded-[14px] overflow-hidden border border-[var(--accent)]/40 shadow-2xl shadow-[var(--accent)]/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={w.thumbPath} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-[var(--accent)] rounded-full px-2 py-0.5">
                          <Flame className="h-2.5 w-2.5 text-black" />
                          <span className="text-[9px] font-bold text-black">#{i + 1}</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[var(--accent)] text-xs font-bold">{w.isFree ? 'Free' : `₹${w.price.toFixed(0)}`}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="w-full h-full rounded-[12px] overflow-hidden border border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.thumbPath} alt="" className="w-full h-full object-cover" draggable={false} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {wallpapers.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full bg-white"
              style={{ width: i === current ? 20 : 6, height: 6, opacity: i === current ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
