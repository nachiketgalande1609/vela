import { PublicNav } from '@/app/components/layout/PublicNav'
import { prisma } from '@/lib/db/prisma'
import { Layers, ShieldCheck, Zap } from 'lucide-react'

export const metadata = { title: 'About' }

export default async function AboutPage() {
  let wallpaperCount = 0
  let categoryCount = 0
  try {
    const [wCount, cats] = await Promise.all([
      prisma.wallpaper.count({ where: { published: true } }),
      prisma.wallpaper.findMany({ where: { published: true }, select: { category: true }, distinct: ['category'] }),
    ])
    wallpaperCount = wCount
    categoryCount = cats.length
  } catch {}

  const stats = [
    { label: 'Wallpapers', value: `${wallpaperCount}+` },
    { label: 'Categories', value: `${categoryCount}` },
    { label: 'Resolution', value: '4K' },
    { label: 'Price per wall', value: '₹99' },
  ]

  const values = [
    {
      icon: Layers,
      title: 'AI-generated, carefully curated',
      body: 'Every wallpaper on Vela is created using AI and reviewed before publishing. No noise, no filler — just walls worth putting on your phone.',
    },
    {
      icon: Zap,
      title: 'Built for mobile',
      body: 'All wallpapers are shot or generated at 9:16 aspect ratio, optimised for modern phone screens at full resolution.',
    },
    {
      icon: ShieldCheck,
      title: 'Own what you buy',
      body: 'Buy once, keep forever. Your purchased wallpapers live in your library and can be re-downloaded any time.',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <main className="w-full mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-medium text-[var(--accent)] tracking-widest uppercase mb-5">
            Our Story
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold text-[var(--text)] leading-tight mb-5"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Walls worth having.
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-xl mx-auto">
            Vela started with a simple frustration — free wallpaper sites are full of clutter, watermarks, and low-res JPEGs.
            Premium phones deserve better walls. So we built a place to find them — every wallpaper on Vela is AI-generated, curated, and optimised for your screen.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
              <p className="text-2xl font-bold text-[var(--accent)] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                {s.value}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--accent)]/10">
                <Icon className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-2">{title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Founder */}
        <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xl font-bold text-[var(--accent)]"
            style={{ fontFamily: 'var(--font-playfair)' }}>
            NG
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] mb-1">Founder</p>
            <h2 className="text-lg font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              Nachiket Galande
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-lg">
              Designer, developer, and the person who spent way too long looking for a good dark wallpaper.
              Vela is a side project built out of genuine need — a clean, well-curated place to find wallpapers
              you&apos;d actually want to pay for. Every wallpaper is AI-generated and reviewed before it goes live.
            </p>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Questions or feedback?{' '}
              <a href="mailto:nachiket4251@gmail.com" className="text-[var(--accent)] hover:underline">
                nachiket4251@gmail.com
              </a>
            </p>
          </div>
        </div>

      </main>
    </div>
  )
}
