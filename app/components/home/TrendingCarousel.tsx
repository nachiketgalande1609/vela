'use client'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
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
const STEP = CARD_W + GAP   // 232px per card slot
const SWIPE_THRESHOLD = 50
const TRANSITION_MS = 450

export function TrendingCarousel({ wallpapers }: Props) {
  const N = wallpapers.length
  // Triple the array so we always have cards to slide into on both sides
  const tripled = useMemo(() => [...wallpapers, ...wallpapers, ...wallpapers], [wallpapers])

  // virtualIdx lives in [N, 2N-1]. After each move we silently snap back if we drift out.
  const [virtualIdx, setVirtualIdx] = useState(N)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [animated, setAnimated] = useState(true)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const vidxRef = useRef(N)           // mirrors virtualIdx, readable synchronously
  const touchStartXRef = useRef<number | null>(null)
  const dragOffsetRef = useRef(0)

  // After the slide animation finishes, silently reset virtualIdx to the middle zone
  const scheduleNormalize = useCallback(() => {
    setTimeout(() => {
      setVirtualIdx(v => {
        const normalized = ((v - N) % N + N) % N + N
        if (v === normalized) return v
        setAnimated(false)
        vidxRef.current = normalized
        requestAnimationFrame(() => setAnimated(true))
        return normalized
      })
    }, TRANSITION_MS + 60)
  }, [N])

  const navigate = useCallback((delta: number) => {
    vidxRef.current += delta
    setVirtualIdx(vidxRef.current)
    setResetKey(k => k + 1)
    scheduleNormalize()
  }, [scheduleNormalize])

  const next = useCallback(() => navigate(1), [navigate])
  const prev = useCallback(() => navigate(-1), [navigate])

  // Jump to a specific real card taking the shortest path
  const goToReal = useCallback((realIdx: number) => {
    const currentReal = ((vidxRef.current % N) + N) % N
    let delta = ((realIdx - currentReal) % N + N) % N
    if (delta > N / 2) delta -= N
    if (delta !== 0) navigate(delta)
  }, [N, navigate])

  useEffect(() => {
    if (paused || N < 2) return
    const t = setInterval(() => navigate(1), 2500)
    return () => clearInterval(t)
  }, [paused, N, resetKey, navigate])

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
    // Reset in the same batch so CSS transition picks up from the finger position
    setIsDragging(false)
    setDragOffset(0)
    setPaused(false)
    if (delta < -SWIPE_THRESHOLD) next()
    else if (delta > SWIPE_THRESHOLD) prev()
  }, [next, prev])

  if (!N) return null

  const activeReal = ((virtualIdx % N) + N) % N
  const trackTransition = isDragging
    ? 'none'
    : animated
      ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
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

        {/* Sliding track — all 3× cards in a row, track translates to keep active card centred */}
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
              transform: `translateX(calc(50% - ${CARD_W / 2}px - ${virtualIdx * STEP}px + ${dragOffset}px))`,
              transition: trackTransition,
            }}
          >
            {tripled.map((w, i) => {
              const dist = Math.abs(i - virtualIdx)
              const isCenter = dist === 0
              const opacity = isCenter ? 1 : dist === 1 ? 0.4 : dist === 2 ? 0.2 : 0

              return (
                <div
                  key={i}
                  style={{ width: CARD_W, aspectRatio: '9/16', flexShrink: 0, opacity, transition: 'opacity 450ms', pointerEvents: opacity === 0 ? 'none' : undefined }}
                  onClick={!isCenter ? (i < virtualIdx ? prev : next) : undefined}
                  className={!isCenter && opacity > 0 ? 'cursor-pointer' : ''}
                >
                  {isCenter ? (
                    <Link href={`/wallpapers/${w.id}`} className="group block w-full h-full">
                      <div className="relative w-full h-full rounded-[14px] overflow-hidden border border-[var(--accent)]/40 shadow-2xl shadow-[var(--accent)]/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={w.thumbPath} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-[var(--accent)] rounded-full px-2 py-0.5">
                          <Flame className="h-2.5 w-2.5 text-black" />
                          <span className="text-[9px] font-bold text-black">#{activeReal + 1}</span>
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

        {/* Dot indicators keyed to real index */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {wallpapers.map((_, i) => (
            <button
              key={i}
              onClick={() => goToReal(i)}
              className="transition-all duration-300 rounded-full bg-white"
              style={{ width: i === activeReal ? 20 : 6, height: 6, opacity: i === activeReal ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
