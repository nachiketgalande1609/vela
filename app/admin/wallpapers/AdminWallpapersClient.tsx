'use client'
import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Upload, Trash2, Eye, EyeOff, Plus, X } from 'lucide-react'

interface WallpaperRow {
  id: string
  title: string
  price: number
  category: string
  published: boolean
  thumbPath: string
  createdAt: string
}

const CATEGORIES = ['Abstract', 'Nature', 'Dark', 'Minimal', 'Architecture', 'Neon']

const inputClass = 'w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors'

export function AdminWallpapersClient({ initial }: { initial: WallpaperRow[] }) {
  const [wallpapers, setWallpapers] = useState<WallpaperRow[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '', description: '', category: 'Abstract', tags: '', price: '1.99',
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const pickFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    if (!form.title) setForm((prev) => ({ ...prev, title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') }))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) pickFile(f)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { toast.error('Select a file'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('category', form.category)
      fd.append('tags', form.tags)
      fd.append('price', form.price)

      const res = await fetch('/api/admin/wallpapers', { method: 'POST', body: fd })
      const data = await res.json() as { wallpaper?: WallpaperRow; error?: string }
      if (!res.ok || !data.wallpaper) { toast.error(data.error ?? 'Upload failed'); return }

      setWallpapers((prev) => [data.wallpaper!, ...prev])
      setShowForm(false); setFile(null); setPreview(null)
      setForm({ title: '', description: '', category: 'Abstract', tags: '', price: '1.99' })
      toast.success('Wallpaper uploaded and previews generated')
    } finally {
      setUploading(false)
    }
  }

  const togglePublished = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/wallpapers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !current }),
    })
    if (res.ok) {
      setWallpapers((prev) => prev.map((w) => w.id === id ? { ...w, published: !current } : w))
      toast.success(current ? 'Unpublished' : 'Published')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wallpaper? This cannot be undone.')) return
    const res = await fetch(`/api/admin/wallpapers/${id}`, { method: 'DELETE' })
    if (res.ok) { setWallpapers((prev) => prev.filter((w) => w.id !== id)); toast.success('Deleted') }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Wallpapers
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{wallpapers.length} total</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-black hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload wallpaper
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">New wallpaper</h2>
            <button type="button" onClick={() => { setShowForm(false); setFile(null); setPreview(null) }}
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`flex w-36 cursor-pointer flex-col items-center justify-center rounded-[4px] border-2 border-dashed transition-colors ${dragOver ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--text-muted)]/40'}`}
              style={{ aspectRatio: '9/16' }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-cover rounded-[2px]" />
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Upload className="h-5 w-5 text-[var(--text-muted)]" />
                  <p className="text-[10px] text-[var(--text-muted)]">Drop or click</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required placeholder="e.g. Midnight Cosmos" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Price (USD)</label>
                  <input type="number" step="0.01" min="0.99" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required className={inputClass} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c} className="bg-[#111]">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Tags</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="dark, moody, abstract" className={inputClass} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} placeholder="Short description…"
                  className={`${inputClass} resize-none`} />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={uploading}
                  className="rounded-[4px] bg-[var(--accent)] px-5 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
                  {uploading ? 'Generating previews…' : 'Upload & save'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFile(null); setPreview(null) }}
                  className="rounded-[4px] border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {wallpapers.length === 0 ? (
          <p className="p-12 text-center text-sm text-[var(--text-muted)]">No wallpapers yet. Upload one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Preview</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Title</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Price</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {wallpapers.map((w) => (
                <tr key={w.id} className="hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-8 rounded-[2px] overflow-hidden bg-[var(--surface-2)]">
                      <Image src={w.thumbPath} alt={w.title} fill className="object-cover" sizes="32px" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--text)] max-w-[180px] truncate">{w.title}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] hidden sm:table-cell">{w.category}</td>
                  <td className="px-4 py-3 text-[var(--text)]">${w.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-[4px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${w.published ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                      {w.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => void togglePublished(w.id, w.published)}
                        title={w.published ? 'Unpublish' : 'Publish'}
                        className="rounded-[4px] p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
                        {w.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => void handleDelete(w.id)}
                        title="Delete"
                        className="rounded-[4px] p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
