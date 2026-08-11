'use client'
import { useState, useRef, Fragment, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Trash2, Plus, ChevronDown, ChevronUp, Trash, Check, Loader2, IndianRupee, ChevronRight, Search, X, Tag } from 'lucide-react'

interface WallpaperRow {
  id: string
  title: string
  price: number
  isFree: boolean
  category: string
  published: boolean
  thumbPath: string
  previewPath: string
  createdAt: string
  packs: { id: string; title: string }[]
}

interface PackOption { id: string; title: string }

import { CATEGORIES as BASE_CATEGORIES } from '@/lib/categories'
const CATEGORIES = [...BASE_CATEGORIES, 'Uncategorised']
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
            placeholder="29"
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

function ImagePreviewDialog({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-[8px] shadow-2xl border border-white/10" style={{ width: 220, aspectRatio: '9/16' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} className="w-full h-full object-cover" />
        </div>
        <p className="text-sm text-white/70 truncate max-w-[220px]">{title}</p>
      </div>
    </div>
  )
}

function GenreDialog({ count, onConfirm, onClose }: { count: number; onConfirm: (category: string) => void; onClose: () => void }) {
  const [category, setCategory] = useState(CATEGORIES[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
          Edit genre for {count} wallpaper{count > 1 ? 's' : ''}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Assign a new genre to all selected wallpapers.</p>
        <div className="mt-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          >
            {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-[4px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(category); onClose() }}
            className="rounded-[4px] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] transition-colors">
            Update genre
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AdminWallpapersClient({ initial, allPacks }: { initial: WallpaperRow[]; allPacks: PackOption[] }) {
  const [wallpapers, setWallpapers] = useState<WallpaperRow[]>(initial)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, { title: string; price: string; isFree: boolean; category: string; tags: string; description: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)

  // filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [packFilter, setPackFilter] = useState('all')

  const filteredWallpapers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return wallpapers.filter((w) => {
      if (q && !w.title.toLowerCase().includes(q)) return false
      if (categoryFilter !== 'all' && w.category !== categoryFilter) return false
      if (packFilter === 'none' && w.packs.length > 0) return false
      if (packFilter !== 'all' && packFilter !== 'none' && !w.packs.some((p) => p.id === packFilter)) return false
      return true
    })
  }, [wallpapers, search, categoryFilter, packFilter])

  const filtersActive = search !== '' || categoryFilter !== 'all' || packFilter !== 'all'

  // selection (operates on filtered rows so "select all" only selects visible)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allIds = useMemo(() => filteredWallpapers.map((w) => w.id), [filteredWallpapers])
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(allIds))

  // dialogs
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null)
  const [showPriceDialog, setShowPriceDialog] = useState(false)
  const [showGenreDialog, setShowGenreDialog] = useState(false)
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null)

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

  const handleBulkGenre = async (category: string) => {
    const ids = Array.from(selected)
    const res = await fetch('/api/admin/wallpapers/bulk-update-category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, category }),
    })
    if (res.ok) {
      setWallpapers((p) => p.map((w) => ids.includes(w.id) ? { ...w, category } : w))
      setSelected(new Set())
      toast.success(`Genre updated for ${ids.length} wallpaper${ids.length > 1 ? 's' : ''}`)
    } else toast.error('Genre update failed')
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
    setEditForms((p) => ({ ...p, [w.id]: { title: w.title, price: String(w.price), isFree: w.isFree, category: w.category, tags: '', description: '' } }))
  }

  const saveEdit = async (id: string) => {
    const f = editForms[id]
    if (!f) return
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/wallpapers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: f.title, price: parseFloat(f.price), isFree: f.isFree ?? false, category: f.category, tags: f.tags, description: f.description }),
      })
      if (!res.ok) { toast.error('Save failed'); return }
      setWallpapers((p) => p.map((w) => w.id === id ? { ...w, title: f.title, price: parseFloat(f.price), isFree: f.isFree ?? false, category: f.category } : w))
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

      <div className="sticky top-16 z-20 bg-[var(--bg)] pb-2 space-y-4">
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
              <button onClick={() => setShowGenreDialog(true)}
                className="flex items-center gap-1.5 rounded-[4px] border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <Tag className="h-3.5 w-3.5" /> Edit genre
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

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
        </select>
        <select
          value={packFilter}
          onChange={(e) => setPackFilter(e.target.value)}
          className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
        >
          <option value="all">All packs</option>
          <option value="none">No pack</option>
          {allPacks.map((p) => <option key={p.id} value={p.id} className="bg-[#111]">{p.title}</option>)}
        </select>
        {filtersActive && (
          <button
            onClick={() => { setSearch(''); setCategoryFilter('all'); setPackFilter('all') }}
            className="flex items-center gap-1.5 rounded-[4px] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
        <span className="text-xs text-[var(--text-muted)] ml-auto">
          {filteredWallpapers.length} of {wallpapers.length}
        </span>
      </div>
      </div>

      {/* Table */}
      <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {filteredWallpapers.length === 0 ? (
          wallpapers.length === 0
            ? <p className="p-12 text-center text-sm text-[var(--text-muted)]">No wallpapers yet. <Link href="/admin/wallpapers/upload" className="text-[var(--accent)] hover:underline">Upload one.</Link></p>
            : <p className="p-12 text-center text-sm text-[var(--text-muted)]">No wallpapers match the current filters.</p>
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
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] hidden md:table-cell">Packs</th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Price</th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallpapers.map((w) => (
                <Fragment key={w.id}>
                  <tr onClick={() => toggleSelect(w.id)} className={`border-t border-[var(--border)] transition-colors cursor-pointer ${selected.has(w.id) ? 'bg-[var(--accent)]/5' : 'hover:bg-[var(--surface-2)]'}`}>
                    <td className="px-4 py-3">
                      <div className={`h-4 w-4 rounded-[3px] border flex items-center justify-center transition-colors ${selected.has(w.id) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)]'}`}>
                        {selected.has(w.id) && <Check className="h-2.5 w-2.5 text-black" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => { e.stopPropagation(); setPreviewImage({ src: w.previewPath, title: w.title }) }}>
                      <div className="relative h-28 w-16 rounded-[4px] overflow-hidden bg-[var(--surface-2)] inline-block cursor-zoom-in hover:ring-2 hover:ring-[var(--accent)]/50 transition-all">
                        <Image src={w.thumbPath} alt={w.title} fill className="object-cover" sizes="64px" unoptimized />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left font-medium text-[var(--text)] max-w-[200px] truncate">{w.title}</td>
                    <td className="px-4 py-3 text-center text-[var(--text-muted)] hidden sm:table-cell">{w.category}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {w.packs.length === 0 ? (
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {w.packs.map((p) => (
                            <Link key={p.id} href={`/packs/${p.id}`} target="_blank" onClick={(e) => e.stopPropagation()}
                              className="rounded-[3px] border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-1.5 py-0.5 text-[10px] text-[var(--accent)] hover:bg-[var(--accent)]/15 transition-colors whitespace-nowrap">
                              {p.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--text)]">
                      {w.isFree ? (
                        <span className="rounded-[4px] px-2 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-400">Free</span>
                      ) : `₹${w.price.toFixed(0)}`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-[4px] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${w.published ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                        {w.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                      <td colSpan={8} className="px-4 py-5 bg-[var(--surface-2)]">
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
                            <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                              <input type="checkbox" checked={editForms[w.id].isFree ?? false}
                                onChange={(e) => setEditForms((p) => ({ ...p, [w.id]: { ...p[w.id], isFree: e.target.checked } }))}
                                className="h-3.5 w-3.5 rounded-[2px] accent-[var(--accent)]" />
                              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Free download</span>
                            </label>
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
      {showGenreDialog && (
        <GenreDialog
          count={selected.size}
          onConfirm={handleBulkGenre}
          onClose={() => setShowGenreDialog(false)}
        />
      )}
      {previewImage && (
        <ImagePreviewDialog
          src={previewImage.src}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  )
}
