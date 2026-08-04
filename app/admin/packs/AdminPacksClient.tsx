'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Trash2, Package, Loader2 } from 'lucide-react'

interface Pack {
  id: string
  title: string
  price: number
  published: boolean
  createdAt: Date | string
  _count: { wallpapers: number; purchases: number }
  wallpapers: { wallpaper: { thumbPath: string } }[]
}

export function AdminPacksClient({ packs: initial }: { packs: Pack[] }) {
  const router = useRouter()
  const [packs, setPacks] = useState(initial)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const togglePublish = async (pack: Pack) => {
    setPublishingId(pack.id)
    try {
      const res = await fetch(`/api/admin/packs/${pack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !pack.published }),
      })
      if (res.ok) {
        setPacks((prev) => prev.map((p) => p.id === pack.id ? { ...p, published: !p.published } : p))
        toast.success(pack.published ? 'Pack unpublished' : 'Pack published')
      } else {
        toast.error('Failed to update')
      }
    } finally {
      setPublishingId(null)
    }
  }

  const deletePack = async (pack: Pack) => {
    if (!confirm(`Delete "${pack.title}"? This cannot be undone.`)) return
    setDeletingId(pack.id)
    try {
      const res = await fetch(`/api/admin/packs/${pack.id}`, { method: 'DELETE' })
      if (res.ok) {
        setPacks((prev) => prev.filter((p) => p.id !== pack.id))
        toast.success('Pack deleted')
      } else {
        toast.error('Delete failed')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (packs.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-[4px] border border-dashed border-[var(--border)] py-20">
        <Package className="h-8 w-8 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">No packs yet</p>
        <a href="/admin/packs/create" className="text-xs text-[var(--accent)] hover:underline">Create your first pack →</a>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--border)]">
          <tr>
            <th className="px-4 py-3 w-20" />
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Title</th>
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-20">Price</th>
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-24">Wallpapers</th>
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-24">Sales</th>
            <th className="px-4 py-3 w-36" />
          </tr>
        </thead>
        <tbody>
          {packs.map((pack) => (
            <tr key={pack.id} className="border-t border-[var(--border)]/50 hover:bg-[var(--surface-2)] transition-colors">
              <td className="px-4 py-2.5">
                <div className="grid grid-cols-2 w-16 h-16 rounded-[3px] overflow-hidden shrink-0">
                  {(pack.wallpapers ?? []).slice(0, 4).map((w, i) => (
                    <div key={i} className="relative overflow-hidden">
                      <Image src={w.wallpaper.thumbPath} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - pack.wallpapers.length) }).map((_, i) => (
                    <div key={`e${i}`} className="bg-[var(--surface-2)]" />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--text)] font-medium">{pack.title}</td>
              <td className="px-4 py-3 text-[var(--accent)]">₹{pack.price.toFixed(0)}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{pack._count.wallpapers}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{pack._count.purchases}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => togglePublish(pack)}
                    disabled={publishingId === pack.id || deletingId === pack.id}
                    className={`inline-flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide border transition-colors disabled:opacity-50 ${pack.published ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}
                  >
                    {publishingId === pack.id
                      ? <><Loader2 className="h-3 w-3 animate-spin" />{pack.published ? 'Unpublishing…' : 'Publishing…'}</>
                      : pack.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deletePack(pack)}
                    disabled={deletingId === pack.id || publishingId === pack.id}
                    title="Delete"
                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deletingId === pack.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
