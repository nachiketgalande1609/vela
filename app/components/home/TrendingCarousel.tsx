'use client'
import { useEffect, useState, useCallback } from 'react'
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

export function TrendingCarousel({ wallpapers }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % wallpapers.length)
    setResetKey((k) => k + 1)
  }, [wallpapers.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + wallpapers.length) % wallpapers.length)
    setResetKey((k) => k + 1)
  }, [wallpapers.length])

  useEffect(() => {
    if (paused || wallpapers.length < 2) return
    const t = setInterval(() => setCurrent((c) => (c + 1) % wallpapers.length), 2500)
    return () => clearInterval(t)
  }, [paused, wallpapers.length, resetKey])

  if (!wallpapers.length) return null

  const getSlide = (offset: number) => wallpapers[(current + offset + wallpapers.length) % wallpapers.length]

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

        {/* Cards */}
        <div className="flex items-end justify-center gap-3">
          {/* Far left — lg only */}
          <div className="hidden lg:block flex-shrink-0 transition-all duration-500 opacity-25 cursor-pointer" style={{ width: 220, aspectRatio: '9/16' }} onClick={prev}>
            <div className="w-full h-full rounded-[12px] overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getSlide(-2).thumbPath} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>

          {/* Left */}
          <div className="flex-shrink-0 transition-all duration-500 opacity-40 cursor-pointer" style={{ width: 220, aspectRatio: '9/16' }} onClick={prev}>
            <div className="w-full h-full rounded-[12px] overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getSlide(-1).thumbPath} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>

          {/* Center */}
          <Link href={`/wallpapers/${getSlide(0).id}`} className="group flex-shrink-0 transition-all duration-500" style={{ width: 220, aspectRatio: '9/16' }}>
            <div className="relative w-full h-full rounded-[14px] overflow-hidden border border-[var(--accent)]/40 shadow-2xl shadow-[var(--accent)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getSlide(0).thumbPath} alt={getSlide(0).title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-[var(--accent)] rounded-full px-2 py-0.5">
                <Flame className="h-2.5 w-2.5 text-black" />
                <span className="text-[9px] font-bold text-black">#{current + 1}</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[var(--accent)] text-xs font-bold">{getSlide(0).isFree ? 'Free' : `₹${getSlide(0).price.toFixed(0)}`}</p>
              </div>
            </div>
          </Link>

          {/* Right */}
          <div className="flex-shrink-0 transition-all duration-500 opacity-40 cursor-pointer" style={{ width: 220, aspectRatio: '9/16' }} onClick={next}>
            <div className="w-full h-full rounded-[12px] overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getSlide(1).thumbPath} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>

          {/* Far right — lg only */}
          <div className="hidden lg:block flex-shrink-0 transition-all duration-500 opacity-25 cursor-pointer" style={{ width: 220, aspectRatio: '9/16' }} onClick={next}>
            <div className="w-full h-full rounded-[12px] overflow-hidden border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getSlide(2).thumbPath} alt="" className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {wallpapers.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300 rounded-full bg-white"
              style={{ width: i === current ? 20 : 6, height: 6, opacity: i === current ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
