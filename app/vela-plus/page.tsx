import { verifySession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { AddSubscriptionToCartButton } from './AddSubscriptionToCartButton'
import { redirect } from 'next/navigation'
import { Check, Infinity, Download, Image, Package, Zap } from 'lucide-react'

export const metadata = { title: 'Vela+' }

const features = [
  { icon: Infinity, text: 'Unlimited downloads — every wallpaper on Vela' },
  { icon: Download, text: 'Instant access to all future uploads' },
  { icon: Image, text: 'Full-resolution PNG files, optimised for mobile' },
  { icon: Package, text: 'All packs included — no extra charge' },
  { icon: Zap, text: 'Cancel anytime, no questions asked' },
]

export default async function VelaPlusPage() {
  const session = await verifySession()

  if (!session) redirect('/auth/login?next=/vela-plus')

  const [sub, subCartItem, wallpaperCount] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.id },
      select: { status: true, currentPeriodEnd: true },
    }),
    prisma.subscriptionCartItem.findUnique({ where: { userId: session.id } }),
    prisma.wallpaper.count({ where: { published: true } }),
  ])

  const isActive = sub?.status === 'active' && new Date() < (sub?.currentPeriodEnd ?? 0)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent)] mb-3">Vela+</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            All wallpapers.<br />One subscription.
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            Access every wallpaper on Vela — including all {wallpaperCount} available now and every upload after.
          </p>
        </div>

        {/* Pricing card */}
        <div className="rounded-[4px] border border-[var(--accent)]/30 bg-[var(--surface)] p-8 mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-bold text-[var(--accent)]" style={{ fontFamily: 'var(--font-playfair)' }}>₹499</span>
            <span className="text-[var(--text-muted)]">/ month</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Billed monthly · Cancel anytime
          </p>

          <ul className="space-y-4 mb-8">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-[var(--text)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
                  <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {isActive ? (
            <div className="flex items-center gap-2 rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-emerald-400 font-medium">
              <Check className="h-5 w-5" />
              You&apos;re already on Vela+ — active until {sub!.currentPeriodEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          ) : (
            <AddSubscriptionToCartButton initialInCart={!!subCartItem} />
          )}
        </div>

        <p className="text-center text-xs text-[var(--text-muted)]">
          Secure payments via Razorpay · UPI, cards, net banking accepted
        </p>
      </div>
    </div>
  )
}
