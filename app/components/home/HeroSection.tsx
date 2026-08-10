import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { SubscribeButton } from '@/app/components/wallpapers/SubscribeButton'

interface Props {
  isAuthenticated: boolean
  hasSubscription: boolean
}

export async function HeroSection({ isAuthenticated, hasSubscription }: Props) {
  let featured: { id: string; thumbPath: string; title: string }[] = []
  try {
    featured = await prisma.wallpaper.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, thumbPath: true, title: true },
    })
  } catch {}

  return (
    <section className="relative w-full overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/6 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent pointer-events-none z-10" />

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-6">

        {/* Left — copy */}
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-block rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-medium text-[var(--accent)] tracking-widest uppercase mb-4">
            Premium Mobile Wallpapers
          </span>

          <h1
            className="text-4xl sm:text-5xl font-bold text-[var(--text)] leading-tight mb-3"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Walls <span className="text-[var(--accent)]">worth having.</span>
          </h1>

          <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 max-w-sm mx-auto lg:mx-0">
            Curated, AI-generated high-resolution wallpapers built for your phone. Buy individual wallpapers for ₹29 or unlock everything with Vela+.
          </p>

          {hasSubscription ? (
            <span className="text-xs text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent)]/10 rounded-[4px] px-3 py-2 inline-block">
              ✓ Vela+ active
            </span>
          ) : (
            <div className="inline-flex flex-col gap-2 justify-center lg:justify-start w-fit">
              <div className="flex items-center gap-4 rounded-[4px] border border-[var(--accent)]/25 bg-[var(--surface)] px-4 py-3">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Unlimited downloads</p>
                  <p className="text-xl font-bold text-[var(--accent)]" style={{ fontFamily: 'var(--font-playfair)' }}>
                    ₹199<span className="text-xs font-normal text-[var(--text-muted)]"> / month</span>
                  </p>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <ul className="text-[11px] text-[var(--text-muted)] space-y-1">
                  <li className="flex items-center gap-1.5"><span className="text-[var(--accent)]">✓</span> Every wallpaper, always</li>
                  <li className="flex items-center gap-1.5"><span className="text-[var(--accent)]">✓</span> New drops every week</li>
                  <li className="flex items-center gap-1.5"><span className="text-[var(--accent)]">✓</span> Cancel anytime</li>
                </ul>
              </div>
              <SubscribeButton isAuthenticated={isAuthenticated} className="w-full justify-center" />
            </div>
          )}
        </div>

        {/* Right — wallpaper fan */}
        {featured.length >= 3 && (
          <div className="relative flex-shrink-0 w-64 sm:w-72 lg:w-80" style={{ height: '280px' }}>
            {/* Glow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-40 h-40 bg-[var(--accent)]/12 blur-3xl rounded-full pointer-events-none" />

            {/* Left card */}
            <div
              className="absolute rounded-[6px] overflow-hidden border border-white/10 shadow-2xl"
              style={{ width: '90px', aspectRatio: '9/16', left: '10px', top: '30px', transform: 'rotate(-8deg)', zIndex: 1 }}
            >
              <Image src={featured[0].thumbPath} alt={featured[0].title} fill className="object-cover" sizes="90px" />
            </div>

            {/* Center card */}
            <div
              className="absolute rounded-[6px] overflow-hidden border border-white/15 shadow-2xl"
              style={{ width: '108px', aspectRatio: '9/16', left: '50%', transform: 'translateX(-50%)', top: '0px', zIndex: 3 }}
            >
              <Image src={featured[1].thumbPath} alt={featured[1].title} fill className="object-cover" sizes="108px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Right card */}
            <div
              className="absolute rounded-[6px] overflow-hidden border border-white/10 shadow-2xl"
              style={{ width: '90px', aspectRatio: '9/16', right: '10px', top: '30px', transform: 'rotate(8deg)', zIndex: 1 }}
            >
              <Image src={featured[2].thumbPath} alt={featured[2].title} fill className="object-cover" sizes="90px" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
