'use client'
import { useState, useRef, Fragment, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Trash2, Plus, ChevronDown, ChevronUp, Trash, Check, Loader2, IndianRupee, ChevronRight } from 'lucide-react'

interface WallpaperRow {
  id: string
  title: string
  price: number
  category: string
  published: boolean
  thumbPath: string
  createdAt: string
}

const CATEGORIES = ['Abstract', 'Nature', 'Dark', 'Minimal', 'Architecture', 'Neon', 'Uncategorised']
const inputClass = 'w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors'

// ── Dialogs ────────────────────────────────────────────────────────────────────

interface ConfirmOptions { title: string; message: string; onConfirm: () => void }

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
          {options.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{options.message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-[4px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Cancel
          </button>
          <button onClick={() => { options.onConfirm(); onClose() }}
            className="rounded-[4px] bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function PriceDialog({ count, onConfirm, onClose }: { count: number; onConfirm: (price: number) => void; onClose: () => void }) {
  const [price, setPrice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
          Edit price for {count} wallpaper{count > 1 ? 's' : ''}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Set a new price (INR ₹) for all selected wallpapers.</p>
        <div className="mt-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">₹</span>
          <input
            ref={inputRef}
            autoFocus
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && price) { onConfirm(parseFloat(price)); onClose() } }}
            placeholder="99"
            className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] pl-7 pr-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-[4px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Cancel
          </button>
          <button
            disabled={!price || isNaN(parseFloat(price))}
            onClick={() => { onConfirm(parseFloat(price)); onClose() }}
            className="rounded-[4px] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-colors">
            Update price
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AdminWallpapersClient({ initial }: { initial: WallpaperRow[] }) {
  const [wallpapers, setWallpapers] = useState<WallpaperRow[]>(initial)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, { title: string; price: string; category: string; tags: string; description: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)

  // selection
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allIds = useMemo(() => wallpapers.map((w) => w.id), [wallpapers])
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(allIds))

  // dialogs
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null)
  const [showPriceDialog, setShowPriceDialog] = useState(false)

  // bulk action states
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkPublishing, setBulkPublishing] = useState(false)

  // ── Bulk actions ──────────────────────────────────────────────────────────

  const handleBulkPublish = async (published: boolean) => {
    const ids = Array.from(selected)
    setBulkPublishing(true)
    try {
      const res = await fetch('/api/admin/wallpapers/bulk-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, published }),
      })
      if (res.ok) {
        setWallpapers((p) => p.map((w) => ids.includes(w.id) ? { ...w, published } : w))
        setSelected(new Set())
        toast.success(`${ids.length} wallpaper${ids.length > 1 ? 's' : ''} ${published ? 'published' : 'unpublished'}`)
      } else toast.error('Action failed')
    } finally { setBulkPublishing(false) }
  }

  const handleBulkPrice = async (price: number) => {
    const ids = Array.from(selected)
    const res = await fetch('/api/admin/wallpapers/bulk-update-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, price }),
    })
    if (res.ok) {
      setWallpapers((p) => p.map((w) => ids.includes(w.id) ? { ...w, price } : w))
      setSelected(new Set())
      toast.success(`Price updated for ${ids.length} wallpaper${ids.length > 1 ? 's' : ''}`)
    } else toast.error('Price update failed')
  }

  const handleBulkDelete = () => {
    const ids = Array.from(selected)
    setConfirmOpts({
      title: `Delete ${ids.length} wallpaper${ids.length > 1 ? 's' : ''}?`,
      message: `This will permanently remove ${ids.length} wallpaper${ids.length > 1 ? 's' : ''} from the database and S3. This cannot be undone.`,
      onConfirm: async () => {
        setBulkDeleting(true)
        try {
          const res = await fetch('/api/admin/wallpapers/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          })
          if (res.ok) {
            setWallpapers((p) => p.filter((w) => !ids.includes(w.id)))
            setSelected(new Set())
            toast.success(`${ids.length} wallpaper${ids.length > 1 ? 's' : ''} deleted`)
          } else toast.error('Bulk delete failed')
        } finally { setBulkDeleting(false) }
      },
    })
  }

  // ── Single row actions ────────────────────────────────────────────────────

  const toggleExpand = (w: WallpaperRow) => {
    if (expandedId === w.id) { setExpandedId(null); return }
    setExpandedId(w.id)
    setEditForms((p) => ({ ...p, [w.id]: { title: w.title, price: String(w.price), category: w.category, tags: '', description: '' } }))
  }

  const saveEdit = async (id: string) => {
    const f = editForms[id]
    if (!f) return
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/wallpapers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: f.title, price: parseFloat(f.price), category: f.category, tags: f.tags, description: f.description }),
      })
      if (!res.ok) { toast.error('Save failed'); return }
      setWallpapers((p) => p.map((w) => w.id === id ? { ...w, title: f.title, price: parseFloat(f.price), category: f.category } : w))
      setExpandedId(null)
      toast.success('Saved')
    } finally { setSaving(null) }
  }

  const togglePublished = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/wallpapers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !current }),
    })
    if (res.ok) {
      setWallpapers((p) => p.map((w) => w.id === id ? { ...w, published: !current } : w))
      toast.success(current ? 'Unpublished' : 'Published')
    }
  }

  const handleDelete = (id: string) => {
    setConfirmOpts({
      title: 'Delete wallpaper?',
      message: 'This will permanently remove the wallpaper from the database and S3. This cannot be undone.',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/wallpapers/${id}`, { method: 'DELETE' })
        if (res.ok) { setWallpapers((p) => p.filter((w) => w.id !== id)); toast.success('Deleted') }
      },
    })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <nav className="flex items-center gap-1 mb-3">
            <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-[var(--border)]" />
            <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3 text-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)]">Wallpapers</span>
          </nav>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Wallpapers</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{wallpapers.length} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {someSelected && (
            <>
              <button onClick={() => void handleBulkPublish(true)} disabled={bulkPublishing}
                className="flex items-center gap-1.5 rounded-[4px] border border-[var(--accent)]/40 px-3 py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:opacity-50 transition-colors">
                {bulkPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Publish {selected.size}
              </button>
              <button onClick={() => void handleBulkPublish(false)} disabled={bulkPublishing}
                className="flex items-center gap-1.5 rounded-[4px] border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50 transition-colors">
                Unpublish {selected.size}
              </button>
              <button onClick={() => setShowPriceDialog(true)}
                className="flex items-center gap-1.5 rounded-[4px] border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <IndianRupee className="h-3.5 w-3.5" /> Edit price
              </button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting}
                className="flex items-center gap-1.5 rounded-[4px] border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors">
                {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash className="h-3.5 w-3.5" />}
                Delete {selected.size}
              </button>
              <div className="h-5 w-px bg-[var(--border)]" />
            </>
          )}
          <Link href="/admin/wallpapers/upload"
            className="flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-black hover:bg-[var(--accent-hover)] transition-colors">
            <Plus className="h-4 w-4" /> Upload
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {wallpapers.length === 0 ? (
          <p className="p-12 text-center text-sm text-[var(--text-muted)]">No wallpapers yet. <Link href="/admin/wallpapers/upload" className="text-[var(--accent)] hover:underline">Upload one.</Link></p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 w-8">
                  <div onClick={toggleSelectAll} className={`h-4 w-4 cursor-pointer rounded-[3px] border flex items-center justify-center transition-colors ${allSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--text-muted)]'}`}>
                    {allSelected && <Check className="h-2.5 w-2.5 text-black" />}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Preview</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Title</th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Price</th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallpapers.map((w) => (
                <Fragment key={w.id}>
                  <tr className={`border-t border-[var(--border)] transition-colors ${selected.has(w.id) ? 'bg-[var(--accent)]/5' : 'hover:bg-[var(--surface-2)]'}`}>
                    <td className="px-4 py-3">
                      <div onClick={() => toggleSelect(w.id)} className={`h-4 w-4 cursor-pointer rounded-[3px] border flex items-center justify-center transition-colors ${selected.has(w.id) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--text-muted)]'}`}>
                        {selected.has(w.id) && <Check className="h-2.5 w-2.5 text-black" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative h-20 w-11 rounded-[2px] overflow-hidden bg-[var(--surface-2)] inline-block">
                        <Image src={w.thumbPath} alt={w.title} fill className="object-cover" sizes="44px" unoptimized />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left font-medium text-[var(--text)] max-w-[200px] truncate">{w.title}</td>
                    <td className="px-4 py-3 text-center text-[var(--text-muted)] hidden sm:table-cell">{w.category}</td>
                    <td className="px-4 py-3 text-center text-[var(--text)]">₹{w.price.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-[4px] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${w.published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                        {w.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => void togglePublished(w.id, w.published)}
                          className={`rounded-[4px] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide border transition-colors ${w.published ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}>
                          {w.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <div className="h-4 w-px bg-[var(--border)]" />
                        <button onClick={() => toggleExpand(w)}
                          className="rounded-[4px] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]/40 transition-colors flex items-center gap-1">
                          Edit {expandedId === w.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                        <button onClick={() => handleDelete(w.id)} title="Delete"
                          className="rounded-[4px] p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === w.id && editForms[w.id] && (
                    <tr className="border-t border-[var(--accent)]/20">
                      <td colSpan={7} className="px-4 py-5 bg-[var(--surface-2)]">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Title</label>
                            <input value={editForms[w.id].title}
                              onChange={(e) => setEditForms((p) => ({ ...p, [w.id]: { ...p[w.id], title: e.target.value } }))}
                              className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Price (INR ₹)</label>
                            <input type="number" step="0.01" min="0" value={editForms[w.id].price}
                              onChange={(e) => setEditForms((p) => ({ ...p, [w.id]: { ...p[w.id], price: e.target.value } }))}
                              className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Category</label>
                            <select value={editForms[w.id].category}
                              onChange={(e) => setEditForms((p) => ({ ...p, [w.id]: { ...p[w.id], category: e.target.value } }))}
                              className={inputClass}>
                              {CATEGORIES.map((c) => <option key={c} className="bg-[#111]">{c}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Tags</label>
                            <input value={editForms[w.id].tags}
                              onChange={(e) => setEditForms((p) => ({ ...p, [w.id]: { ...p[w.id], tags: e.target.value } }))}
                              placeholder="dark, moody" className={inputClass} />
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                          <textarea value={editForms[w.id].description}
                            onChange={(e) => setEditForms((p) => ({ ...p, [w.id]: { ...p[w.id], description: e.target.value } }))}
                            rows={2} className={`${inputClass} resize-none`} />
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button onClick={() => void saveEdit(w.id)} disabled={saving === w.id}
                            className="rounded-[4px] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
                            {saving === w.id ? 'Saving…' : 'Save changes'}
                          </button>
                          <button onClick={() => setExpandedId(null)}
                            className="rounded-[4px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmOpts && <ConfirmDialog options={confirmOpts} onClose={() => setConfirmOpts(null)} />}
      {showPriceDialog && (
        <PriceDialog
          count={selected.size}
          onConfirm={handleBulkPrice}
          onClose={() => setShowPriceDialog(false)}
        />
      )}
    </div>
  )
}
