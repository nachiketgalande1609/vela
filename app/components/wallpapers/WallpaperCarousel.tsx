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
        width: 252,
        borderRadius: 46,
        background: 'linear-gradient(160deg, #2a2a2a 0%, #0c0c0c 100%)',
        padding: 4,
        boxShadow:
          '0 0 0 0.5px #404040, 0 0 0 1.5px #1a1a1a, inset 0 0 0 0.5px #3a3a3a, 0 40px 100px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Dynamic Island — iPhone 17: narrower pill */}
      <div
        style={{
          position: 'absolute',
          zIndex: 20,
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 62,
          height: 19,
          borderRadius: 10,
          background: '#000',
        }}
      />
      {/* Action button */}
      <div style={{ position: 'absolute', top: 96, left: -2.5, width: 2.5, height: 16, borderRadius: 1.5, background: '#252525' }} />
      {/* Volume up */}
      <div style={{ position: 'absolute', top: 124, left: -2.5, width: 2.5, height: 32, borderRadius: 1.5, background: '#252525' }} />
      {/* Volume down */}
      <div style={{ position: 'absolute', top: 164, left: -2.5, width: 2.5, height: 32, borderRadius: 1.5, background: '#252525' }} />
      {/* Power / side */}
      <div style={{ position: 'absolute', top: 136, right: -2.5, width: 2.5, height: 50, borderRadius: 1.5, background: '#252525' }} />

      {/* Screen */}
      <div
        style={{
          borderRadius: 42,
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

function SvgIcon({ bg, size = 42, fill = false, children }: { bg: string; size?: number; fill?: boolean; children: React.ReactNode }) {
  const iconSize = fill ? size : Math.round(size * 0.64)
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.225), background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" style={{ display: 'block' }}>
        {children}
      </svg>
    </div>
  )
}

// ── Shared icon paths ─────────────────────────────────────────────────────────

const PhoneIcon = () => (
  <path d="M6.8 10.6c1.3 2.6 3.6 4.8 6.2 6.2l2.1-2.1c.3-.3.6-.3.9-.1 1 .4 2.2.6 3.4.6.5 0 .9.4.9.9v3.4c0 .5-.4.9-.9.9C9.5 20.4 3 13.9 3 5.9c0-.5.4-.9.9-.9H7.4c.5 0 .9.4.9.9 0 1.2.2 2.4.6 3.4.1.3 0 .6-.1.9l-2 2.4z" fill="white"/>
)

const FaceTimeIcon = () => (
  <>
    <path d="M2 8.5C2 7.4 2.9 6.5 4 6.5H13.5C14.6 6.5 15.5 7.4 15.5 8.5V15.5C15.5 16.6 14.6 17.5 13.5 17.5H4C2.9 17.5 2 16.6 2 15.5V8.5Z" fill="white"/>
    <path d="M15.5 10.2L22 7.5V16.5L15.5 13.8V10.2Z" fill="white"/>
  </>
)

const SafariIcon = () => (
  <>
    {/* Outer ring */}
    <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6"/>
    {/* 4 cardinal ticks only */}
    <line x1="12" y1="2.5" x2="12" y2="4.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="21.5" y1="12" x2="19.5" y2="12" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round"/>
    <line x1="12" y1="21.5" x2="12" y2="19.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round"/>
    <line x1="2.5" y1="12" x2="4.5" y2="12" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round"/>
    {/* N needle — white (pointing up) */}
    <polygon points="12,4 13.8,11.5 12,10 10.2,11.5" fill="white"/>
    {/* S needle — red (pointing down) */}
    <polygon points="12,20 10.2,12.5 12,14 13.8,12.5" fill="#FF3B30"/>
    <circle cx="12" cy="12" r="1.6" fill="white"/>
  </>
)

const CameraIcon = () => (
  <>
    <path d="M22 17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V9C2 7.9 2.9 7 4 7H7.5L9.5 5H14.5L16.5 7H20C21.1 7 22 7.9 22 9V17Z" fill="none" stroke="white" strokeWidth="1.3"/>
    <circle cx="12" cy="13" r="3.8" fill="none" stroke="white" strokeWidth="1.3"/>
    <circle cx="12" cy="13" r="1.7" fill="rgba(255,255,255,0.28)"/>
    <circle cx="18.5" cy="9.5" r="1" fill="white"/>
  </>
)

// ── Grid + Dock data ──────────────────────────────────────────────────────────

const APP_GRID_DATA: { icon: React.ReactNode; label: string }[] = [
  {
    label: 'Safari',
    icon: <SvgIcon bg="linear-gradient(175deg,#1194FA 0%,#006ADE 100%)"><SafariIcon /></SvgIcon>,
  },
  {
    label: 'FaceTime',
    icon: <SvgIcon bg="linear-gradient(180deg,#62DB5B 0%,#22A830 100%)"><FaceTimeIcon /></SvgIcon>,
  },
  {
    label: 'Photos',
    icon: (
      <SvgIcon bg="white" fill>
        {(['#FF3B30','#FF9500','#FFCC00','#34C759','#30B0C7','#007AFF','#5856D6','#FF2D55'] as const).map((c, i) => (
          <g key={i} transform={`rotate(${i * 45} 12 12)`}>
            <ellipse cx="12" cy="6" rx="2.6" ry="4.4" fill={c}/>
          </g>
        ))}
        <circle cx="12" cy="12" r="3.6" fill="white"/>
      </SvgIcon>
    ),
  },
  {
    label: 'Camera',
    icon: <SvgIcon bg="linear-gradient(145deg,#3A3A3C 0%,#1C1C1E 100%)"><CameraIcon /></SvgIcon>,
  },
  {
    label: 'App Store',
    icon: (
      <SvgIcon bg="linear-gradient(180deg,#35AEFF 0%,#0076E4 100%)">
        <path d="M12 4.5 L6 18.5" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
        <path d="M12 4.5 L18 18.5" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="5" y1="20.5" x2="19" y2="20.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round"/>
      </SvgIcon>
    ),
  },
  {
    label: 'Phone',
    icon: <SvgIcon bg="linear-gradient(180deg,#62DB5B 0%,#22A830 100%)"><PhoneIcon /></SvgIcon>,
  },
  {
    label: 'Calendar',
    icon: (
      <SvgIcon bg="white" fill>
        <rect x="0" y="0" width="24" height="24" fill="white"/>
        <rect x="0" y="0" width="24" height="8.5" fill="#FF3B30"/>
        <text x="12" y="6.5" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="white" fontFamily="system-ui,sans-serif">AUG</text>
        <text x="12" y="21" textAnchor="middle" fontSize="11" fontWeight="200" fill="#1C1C1E" fontFamily="system-ui,sans-serif">6</text>
      </SvgIcon>
    ),
  },
  {
    label: 'Settings',
    icon: (
      <SvgIcon bg="linear-gradient(180deg,#AEAEB2 0%,#636366 100%)">
        <defs>
          <mask id="gear-mask">
            <rect width="24" height="24" fill="white"/>
            <circle cx="12" cy="12" r="3.4" fill="black"/>
          </mask>
        </defs>
        <g mask="url(#gear-mask)">
          <circle cx="12" cy="12" r="5.8" fill="white"/>
          {[0,45,90,135,180,225,270,315].map(deg => (
            <rect key={deg} x="10.8" y="1.8" width="2.4" height="4.8" rx="1.2" fill="white" transform={`rotate(${deg} 12 12)`}/>
          ))}
        </g>
      </SvgIcon>
    ),
  },
]

const DOCK_APPS_DATA = [
  <SvgIcon key="d-phone" bg="linear-gradient(180deg,#62DB5B 0%,#22A830 100%)">
    <PhoneIcon />
  </SvgIcon>,
  <SvgIcon key="d-facetime" bg="linear-gradient(180deg,#62DB5B 0%,#22A830 100%)">
    <FaceTimeIcon />
  </SvgIcon>,
  <SvgIcon key="d-safari" bg="linear-gradient(175deg,#1194FA 0%,#006ADE 100%)">
    <SafariIcon />
  </SvgIcon>,
  <SvgIcon key="d-camera" bg="linear-gradient(145deg,#3A3A3C 0%,#1C1C1E 100%)">
    <CameraIcon />
  </SvgIcon>,
]

function HomeOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 10px 0px',
        background: 'rgba(0,0,0,0.05)',
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
          marginBottom: 12,
          padding: '0 10px',
        }}
      >
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <svg width="13" height="9" viewBox="0 0 13 9" fill="white">
            <rect x="0" y="5" width="2.5" height="4" rx="0.5"/>
            <rect x="3.5" y="3" width="2.5" height="6" rx="0.5"/>
            <rect x="7" y="1" width="2.5" height="8" rx="0.5"/>
            <rect x="10.5" y="0" width="2.5" height="9" rx="0.5" opacity="0.35"/>
          </svg>
          <svg width="13" height="9" viewBox="0 0 20 14" fill="white">
            <path d="M10 10.5l1.8 2.5H8.2L10 10.5z"/>
            <path d="M6.5 7.5c.9-.9 2.2-1.5 3.5-1.5s2.6.6 3.5 1.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <path d="M2.5 4C4.7 1.8 7.2.5 10 .5s5.3 1.3 7.5 3.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
          <svg width="18" height="9" viewBox="0 0 18 9" fill="white">
            <rect x="0" y="0.5" width="14" height="8" rx="2" fill="none" stroke="white" strokeWidth="1"/>
            <rect x="14.5" y="2.5" width="2" height="4" rx="1"/>
            <rect x="1" y="1.5" width="10" height="6" rx="1.5"/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* App grid — pinned to bottom above dock */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          alignContent: 'end',
          marginBottom: 8,
          justifyItems: 'center',
        }}
      >
        {APP_GRID_DATA.map(({ icon, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {icon}
            <span style={{
              fontSize: 8,
              color: 'white',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              textAlign: 'center',
              textShadow: '0 0.5px 2px rgba(0,0,0,0.6)',
              lineHeight: 2,
              maxWidth: 44,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(20px)',
          borderRadius: 18,
          padding: '8px 2px',
        }}
      >
        {DOCK_APPS_DATA.map((icon, i) => (
          <div key={i} style={{ width: 42, height: 42 }}>{icon}</div>
        ))}
      </div>

      {/* Home indicator */}
      <div style={{ width: 90, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)', margin: '8px auto 0' }} />
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
