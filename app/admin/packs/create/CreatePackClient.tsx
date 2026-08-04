'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface Wallpaper {
  id: string
  title: string
  thumbPath: string
  category: string
}

const inputClass = 'w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors'

export function CreatePackClient({ wallpapers }: { wallpapers: Wallpaper[] }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('250')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filtered = wallpapers.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title required'); return }
    if (selected.size === 0) { toast.error('Select at least one wallpaper'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price: parseFloat(price) || 250, wallpaperIds: [...selected] }),
      })
      const data = await res.json() as { pack?: { id: string }; error?: string }
      if (!res.ok || !data.pack) { toast.error(data.error ?? 'Failed to create pack'); return }
      toast.success('Pack created!')
      router.push('/admin/packs')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Pack details */}
      <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <h2 className="text-sm font-medium text-[var(--text)]">Pack Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dark & Moody Collection" className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Price (INR ₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="1" className={inputClass} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional — shown on the pack page" className={`${inputClass} resize-none`} />
        </div>
      </div>

      {/* Wallpaper picker */}
      <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-[var(--text)]">
            Select Wallpapers
            {selected.size > 0 && <span className="ml-2 text-[var(--accent)]">({selected.size} selected)</span>}
          </h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-48 rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {wallpapers.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No published wallpapers found. Upload and publish wallpapers first.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 max-h-[480px] overflow-y-auto pr-1">
            {filtered.map((w) => {
              const isSelected = selected.has(w.id)
              return (
                <button
                  key={w.id}
                  onClick={() => toggle(w.id)}
                  className={`relative rounded-[4px] border-2 overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-[var(--accent)]' : 'border-transparent hover:border-[var(--border)]'}`}
                  style={{ aspectRatio: '9/16' }}
                  title={w.title}
                >
                  <Image src={w.thumbPath} alt={w.title} fill className="object-cover" sizes="80px" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[var(--accent)]/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[var(--accent)] drop-shadow" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving…' : 'Create Pack'}
        </button>
        <button onClick={() => router.push('/admin/packs')} className="rounded-[4px] border border-[var(--border)] px-5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
