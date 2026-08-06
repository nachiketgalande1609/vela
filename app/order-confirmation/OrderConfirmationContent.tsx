'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Infinity, ShoppingBag } from 'lucide-react'

export function OrderConfirmationContent() {
  const params = useSearchParams()
  const type = params.get('type')
  const paymentId = params.get('pid')
  const total = params.get('total')
  const count = params.get('count')

  const isSubscription = type === 'subscription'

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/15">
          {isSubscription
            ? <Infinity className="h-9 w-9 text-[var(--accent)]" />
            : <CheckCircle2 className="h-9 w-9 text-[var(--accent)]" />
          }
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
        {isSubscription ? 'Welcome to Vela+' : 'Order Confirmed'}
      </h1>

      <p className="text-[var(--text-muted)] mb-8">
        {isSubscription
          ? 'Your Vela+ subscription is now active. Every wallpaper on Vela is yours to download — and anything you download, you keep forever.'
          : `Payment successful. ${count ? `${count} item${Number(count) !== 1 ? 's' : ''} added to your library.` : 'Your items have been added to your library.'}`
        }
      </p>

      {/* Receipt card */}
      <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 text-left mb-8 space-y-3">
        {isSubscription ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Plan</span>
              <span className="text-[var(--text)] font-medium">Vela+ Monthly</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Amount</span>
              <span className="text-[var(--accent)] font-semibold">₹199 / month</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Status</span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
          </>
        ) : (
          <>
            {total && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Total paid</span>
                <span className="text-[var(--accent)] font-semibold">₹{Number(total).toFixed(0)}</span>
              </div>
            )}
            {count && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Items purchased</span>
                <span className="text-[var(--text)] font-medium">{count}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Payment ID</span>
                <span className="text-[var(--text)] font-mono text-xs truncate max-w-[180px]">{paymentId}</span>
              </div>
            )}
          </>
        )}
        <p className="text-[10px] text-[var(--text-muted)] pt-1">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-[4px] bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-black hover:bg-[var(--accent-hover)] transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          Go to My Library
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-[4px] border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
        >
          Browse More Wallpapers
        </Link>
      </div>
    </div>
  )
}
