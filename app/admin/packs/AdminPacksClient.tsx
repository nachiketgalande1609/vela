'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2, Eye, EyeOff, Package } from 'lucide-react'

interface Pack {
  id: string
  title: string
  price: number
  published: boolean
  createdAt: Date | string
  _count: { wallpapers: number; purchases: number }
}

export function AdminPacksClient({ packs: initial }: { packs: Pack[] }) {
  const router = useRouter()
  const [packs, setPacks] = useState(initial)

  const togglePublish = async (pack: Pack) => {
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
  }

  const deletePack = async (pack: Pack) => {
    if (!confirm(`Delete "${pack.title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/packs/${pack.id}`, { method: 'DELETE' })
    if (res.ok) {
      setPacks((prev) => prev.filter((p) => p.id !== pack.id))
      toast.success('Pack deleted')
    } else {
      toast.error('Delete failed')
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
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Title</th>
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-20">Price</th>
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-24">Wallpapers</th>
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-24">Sales</th>
            <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-24">Status</th>
            <th className="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody>
          {packs.map((pack) => (
            <tr key={pack.id} className="border-t border-[var(--border)]/50 hover:bg-[var(--surface-2)] transition-colors">
              <td className="px-4 py-3 text-[var(--text)] font-medium">{pack.title}</td>
              <td className="px-4 py-3 text-[var(--accent)]">₹{pack.price.toFixed(0)}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{pack._count.wallpapers}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{pack._count.purchases}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-[2px] px-2 py-0.5 text-[10px] font-medium ${pack.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                  {pack.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => togglePublish(pack)} title={pack.published ? 'Unpublish' : 'Publish'}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {pack.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deletePack(pack)} title="Delete"
                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
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
