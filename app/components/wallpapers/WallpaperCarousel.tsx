'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  src: string
  alt: string
  canAccess: boolean
}

const SLIDES = [
  { id: 'wallpaper', label: 'Wallpaper' },
  { id: 'lock', label: 'Lock Screen' },
  { id: 'home', label: 'Home Screen' },
] as const

// ─── Phone shell ─────────────────────────────────────────────────────────────

function PhoneShell({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto flex-shrink-0"
      style={{
        width: 248,
        borderRadius: 42,
        background: 'linear-gradient(160deg, #242424 0%, #0f0f0f 100%)',
        padding: 7,
        boxShadow:
          '0 0 0 1px #303030, inset 0 0 0 0.5px #3a3a3a, 0 30px 90px rgba(0,0,0,0.75)',
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: 'absolute',
          zIndex: 20,
          top: 15,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 78,
          height: 24,
          borderRadius: 12,
          background: '#000',
        }}
      />
      {/* Action button */}
      <div style={{ position: 'absolute', top: 100, left: -3, width: 3, height: 18, borderRadius: 1.5, background: '#1e1e1e' }} />
      {/* Volume up */}
      <div style={{ position: 'absolute', top: 130, left: -3, width: 3, height: 34, borderRadius: 1.5, background: '#1e1e1e' }} />
      {/* Volume down */}
      <div style={{ position: 'absolute', top: 173, left: -3, width: 3, height: 34, borderRadius: 1.5, background: '#1e1e1e' }} />
      {/* Power / side */}
      <div style={{ position: 'absolute', top: 140, right: -3, width: 3, height: 52, borderRadius: 1.5, background: '#1e1e1e' }} />

      {/* Screen */}
      <div
        style={{
          borderRadius: 35,
          overflow: 'hidden',
          aspectRatio: '9/19.5',
          position: 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* UI overlay */}
        {children}
      </div>
    </div>
  )
}

// ─── Lock-screen overlay ──────────────────────────────────────────────────────

function LockOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 16px 16px',
        background: 'rgba(0,0,0,0.08)',
      }}
    >
      {/* Time */}
      <div style={{ marginTop: '22%', textAlign: 'center' }}>
        <div
          style={{
            fontSize: 54,
            fontWeight: 200,
            color: '#fff',
            letterSpacing: -1,
            lineHeight: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}
        >
          9:41
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        >
          Wednesday, August 6
        </div>
      </div>

      {/* Notification pill */}
      <div
        style={{
          marginTop: 28,
          width: '90%',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          borderRadius: 14,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #C9A86C, #8B6914)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Vela · now</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', marginTop: 1 }}>New wallpapers just dropped</div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Bottom row */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Flashlight */}
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-4 0V10c0-2-2-2-2-4a6 6 0 1 1 8 0z"/>
            <line x1="6" y1="6" x2="6.01" y2="6"/>
          </svg>
        </div>
        {/* Camera */}
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </div>

      {/* Home indicator */}
      <div style={{ width: 90, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)', marginTop: 12 }} />
    </div>
  )
}

// ─── Home-screen overlay ──────────────────────────────────────────────────────

const APP_ICONS: string[] = [
  '#2dd36f', '#3478f6', '#ff9f0a', '#ff2d55',
  '#636366', '#30d158', '#ff375f', '#8e8e93',
  '#3478f6', '#ff3b30', '#1c1c1e', '#ffd60a',
]
const DOCK_ICONS = ['#2dd36f', '#3478f6', '#ff9f0a', '#ff375f']

function HomeOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 14px 12px',
        background: 'rgba(0,0,0,0.08)',
      }}
    >
      {/* Status bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          marginBottom: 18,
        }}
      >
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* Signal */}
          <svg width="13" height="9" viewBox="0 0 13 9" fill="white">
            <rect x="0" y="5" width="2.5" height="4" rx="0.5"/>
            <rect x="3.5" y="3" width="2.5" height="6" rx="0.5"/>
            <rect x="7" y="1" width="2.5" height="8" rx="0.5"/>
            <rect x="10.5" y="0" width="2.5" height="9" rx="0.5" opacity="0.35"/>
          </svg>
          {/* Wifi */}
          <svg width="13" height="9" viewBox="0 0 20 14" fill="white">
            <path d="M10 10.5l1.8 2.5H8.2L10 10.5z"/>
            <path d="M6.5 7.5c.9-.9 2.2-1.5 3.5-1.5s2.6.6 3.5 1.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <path d="M2.5 4C4.7 1.8 7.2.5 10 .5s5.3 1.3 7.5 3.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
          {/* Battery */}
          <svg width="18" height="9" viewBox="0 0 18 9" fill="white">
            <rect x="0" y="0.5" width="14" height="8" rx="2" fill="none" stroke="white" strokeWidth="1"/>
            <rect x="14.5" y="2.5" width="2" height="4" rx="1"/>
            <rect x="1" y="1.5" width="10" height="6" rx="1.5"/>
          </svg>
        </div>
      </div>

      {/* App grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          flex: 1,
        }}
      >
        {APP_ICONS.map((color, i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 13, background: color }} />
        ))}
      </div>

      {/* Dock */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: 22,
          padding: '10px 6px',
          marginTop: 10,
        }}
      >
        {DOCK_ICONS.map((color, i) => (
          <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: color }} />
        ))}
      </div>

      {/* Home indicator */}
      <div style={{ width: 90, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)', margin: '10px auto 0' }} />
    </div>
  )
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

export function WallpaperCarousel({ src, alt, canAccess }: Props) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c === 0 ? 2 : c - 1))
  const next = () => setCurrent((c) => (c === 2 ? 0 : c + 1))

  const displayWidth = 248
  const carouselHeight = 580

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Track */}
      <div className="relative w-full overflow-hidden" style={{ height: carouselHeight }}>
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {/* Slide 1 — plain wallpaper at natural aspect ratio */}
          <div className="min-w-full h-full flex items-center justify-center">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                style={{ display: 'block', width: displayWidth, height: 'auto' }}
                className="rounded-[4px] border border-[var(--border)]"
              />
              {!canAccess && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[4px]">
                  <span className="rounded-[4px] bg-black/60 px-3 py-1.5 text-xs text-[var(--text-muted)] backdrop-blur-sm">
                    Preview only
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Slide 2 — lock screen */}
          <div className="min-w-full h-full flex items-center justify-center">
            <PhoneShell src={src} alt={alt}>
              <LockOverlay />
            </PhoneShell>
          </div>

          {/* Slide 3 — home screen */}
          <div className="min-w-full h-full flex items-center justify-center">
            <PhoneShell src={src} alt={alt}>
              <HomeOverlay />
            </PhoneShell>
          </div>
        </div>

        {/* Left arrow */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] backdrop-blur-sm hover:text-[var(--text)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Right arrow */}
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] backdrop-blur-sm hover:text-[var(--text)] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(i)}
            className="flex flex-col items-center gap-1.5"
          >
            <div
              className={`h-1 rounded-full transition-all duration-200 ${
                i === current
                  ? 'w-5 bg-[var(--accent)]'
                  : 'w-1 bg-[var(--text-muted)]/40'
              }`}
            />
            <span
              className={`text-[10px] transition-colors ${
                i === current ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {slide.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
