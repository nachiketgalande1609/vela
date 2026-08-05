'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, ChevronDown, ChevronUp, Download, Package, Infinity } from 'lucide-react'

type WallpaperItem = {
  id: string
  paymentId: string
  amount: number
  createdAt: Date
  wallpaper: { id: string; title: string; thumbPath: string; category: string; price: number }
}

type PackItem = {
  id: string
  paymentId: string
  amount: number
  createdAt: Date
  pack: { id: string; title: string; price: number; _count: { wallpapers: number } }
}

type Order = {
  paymentId: string
  createdAt: Date
  wallpapers: WallpaperItem[]
  packs: PackItem[]
  total: number
}

type Subscription = {
  subscriptionId: string
  status: string
  currentPeriodEnd: Date
  createdAt: Date
} | null

interface Props {
  orders: Order[]
  subscription: Subscription
}

function OrderCard({ order, orderNumber }: { order: Order; orderNumber: number }) {
  const [expanded, setExpanded] = useState(false)
  const itemCount = order.wallpapers.length + order.packs.length

  return (
    <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]/10">
            <FileText className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">
              Order <span className="text-[var(--accent)]">#{String(orderNumber).padStart(4, '0')}</span>
              <span className="text-[var(--text-muted)] font-normal ml-2">· {itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--accent)]">₹{order.total.toFixed(0)}</span>
          <a
            href={`/api/invoice/${order.paymentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-[4px] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <Download className="h-3 w-3" />
            Invoice
          </a>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Payment ID */}
      <div className="px-5 pb-3 -mt-1">
        <p className="text-[10px] text-[var(--text-muted)] font-mono">ID: {order.paymentId}</p>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
          {order.wallpapers.map((item) => (
            <Link
              key={item.id}
              href={`/wallpapers/${item.wallpaper.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="relative h-10 w-8 flex-shrink-0 overflow-hidden rounded">
                <Image src={item.wallpaper.thumbPath} alt={item.wallpaper.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text)] truncate">{item.wallpaper.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.wallpaper.category}</p>
              </div>
              <span className="text-sm text-[var(--text-muted)] flex-shrink-0">₹{item.amount.toFixed(0)}</span>
            </Link>
          ))}
          {order.packs.map((item) => (
            <Link
              key={item.id}
              href={`/packs/${item.pack.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--surface-2)] flex-shrink-0">
                <Package className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text)] truncate">{item.pack.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.pack._count.wallpapers} wallpapers</p>
              </div>
              <span className="text-sm text-[var(--text-muted)] flex-shrink-0">₹{item.amount.toFixed(0)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function OrdersClient({ orders, subscription }: Props) {
  if (orders.length === 0 && !subscription) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-[var(--text-muted)]">No orders yet.</p>
        <Link href="/" className="text-sm text-[var(--accent)] hover:underline">Browse wallpapers</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Subscription row */}
      {subscription && (
        <div className="rounded-[4px] border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]/15">
              <Infinity className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">Vela+ Monthly</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {subscription.status === 'active'
                  ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : `Status: ${subscription.status}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[var(--accent)]">₹499 / mo</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              subscription.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
            }`}>
              {subscription.status}
            </span>
          </div>
        </div>
      )}

      {/* One-time orders */}
      {orders.map((order, index) => (
        <OrderCard key={order.paymentId} order={order} orderNumber={orders.length - index} />
      ))}
    </div>
  )
}
