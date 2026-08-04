'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'

const CATEGORIES = ['Abstract', 'Nature', 'Dark', 'Minimal', 'Architecture', 'Neon', 'Uncategorised']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const inputClass = 'w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors'
const inputSm = 'w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors'

function nameToTitle(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()
}

interface BulkFile {
  uid: string
  file: File
  objectUrl: string
  title: string
  category: string
  tags: string
  price: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  errorMsg?: string
  wallpaperId?: string
}

export function UploadClient() {
  const router = useRouter()
  const [tab, setTab] = useState<'single' | 'bulk'>('single')

  // single
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'Abstract', tags: '', price: '99' })
  const fileRef = useRef<HTMLInputElement>(null)

  const pickFile = (f: File) => {
    if (f.size > MAX_FILE_SIZE) { toast.error('File too large — max 20 MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    if (!form.title) setForm((p) => ({ ...p, title: nameToTitle(f.name) }))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) pickFile(f)
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { toast.error('Select a file'); return }
    setUploading(true)
    try {
      // 1. Get presigned S3 upload URL
      const presignRes = await fetch('/api/admin/wallpapers/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type || 'image/jpeg' }),
      })
      const { uploadUrl, key, uuid } = await presignRes.json() as { uploadUrl: string; key: string; uuid: string }
      if (!presignRes.ok || !uploadUrl) { toast.error('Could not get upload URL'); return }

      // 2. Upload directly to S3 (bypasses Vercel size limit)
      const s3Res = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'image/jpeg' } })
      if (!s3Res.ok) { toast.error('S3 upload failed'); return }

      // 3. Confirm — server generates previews & saves to DB
      const confirmRes = await fetch('/api/admin/wallpapers/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uuid, title: form.title, description: form.description, category: form.category, tags: form.tags, price: parseFloat(form.price) }),
      })
      const data = await confirmRes.json() as { wallpaper?: unknown; error?: string }
      if (!confirmRes.ok || !data.wallpaper) { toast.error(data.error ?? 'Processing failed'); return }

      toast.success('Uploaded — previews generated')
      setFile(null); setPreview(null)
      setForm({ title: '', description: '', category: 'Abstract', tags: '', price: '99' })
      router.push('/admin/wallpapers')
    } finally { setUploading(false) }
  }

  // bulk
  const [bulkFiles, setBulkFiles] = useState<BulkFile[]>([])
  const [bulkDragOver, setBulkDragOver] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkPublishing, setBulkPublishing] = useState(false)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  const addBulkFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!arr.length) return
    const oversized = arr.filter((f) => f.size > MAX_FILE_SIZE)
    if (oversized.length) toast.error(`${oversized.length} file${oversized.length > 1 ? 's' : ''} skipped — max 20 MB each`)
    const valid = arr.filter((f) => f.size <= MAX_FILE_SIZE)
    if (!valid.length) return
    setBulkFiles((prev) => [...prev, ...valid.map((f) => ({
      uid: crypto.randomUUID(), file: f, objectUrl: URL.createObjectURL(f),
      title: nameToTitle(f.name), category: 'Abstract', tags: '', price: '99', status: 'pending' as const,
    }))])
  }

  const onBulkDrop = (e: React.DragEvent) => {
    e.preventDefault(); setBulkDragOver(false)
    addBulkFiles(e.dataTransfer.files)
  }

  const updateBulkFile = (uid: string, patch: Partial<Pick<BulkFile, 'title' | 'category' | 'tags' | 'price'>>) =>
    setBulkFiles((prev) => prev.map((f) => f.uid === uid ? { ...f, ...patch } : f))

  const removeBulkFile = (uid: string) => {
    setBulkFiles((prev) => {
      const f = prev.find((f) => f.uid === uid)
      if (f) URL.revokeObjectURL(f.objectUrl)
      return prev.filter((f) => f.uid !== uid)
    })
  }

  const uploadAllBulk = async () => {
    const pending = bulkFiles.filter((f) => f.status === 'pending')
    if (!pending.length) { toast.error('No files to upload'); return }
    setBulkUploading(true)
    let uploaded = 0
    for (const bf of pending) {
      setBulkFiles((prev) => prev.map((f) => f.uid === bf.uid ? { ...f, status: 'uploading' } : f))
      try {
        // 1. Presign
        const presignRes = await fetch('/api/admin/wallpapers/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: bf.file.name, contentType: bf.file.type || 'image/jpeg' }),
        })
        const { uploadUrl, key, uuid } = await presignRes.json() as { uploadUrl: string; key: string; uuid: string }
        if (!presignRes.ok || !uploadUrl) throw new Error('Could not get upload URL')

        // 2. Direct S3 upload
        const s3Res = await fetch(uploadUrl, { method: 'PUT', body: bf.file, headers: { 'Content-Type': bf.file.type || 'image/jpeg' } })
        if (!s3Res.ok) throw new Error('S3 upload failed')

        // 3. Confirm
        const confirmRes = await fetch('/api/admin/wallpapers/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, uuid, title: bf.title || nameToTitle(bf.file.name), category: bf.category, tags: bf.tags, price: parseFloat(bf.price || '99'), description: '' }),
        })
        const data = await confirmRes.json() as { wallpaper?: { id: string }; error?: string }
        if (!confirmRes.ok || !data.wallpaper) {
          setBulkFiles((prev) => prev.map((f) => f.uid === bf.uid ? { ...f, status: 'error', errorMsg: data.error ?? 'Failed' } : f))
        } else {
          setBulkFiles((prev) => prev.map((f) => f.uid === bf.uid ? { ...f, status: 'done', wallpaperId: data.wallpaper!.id } : f))
          uploaded++
        }
      } catch (err) {
        setBulkFiles((prev) => prev.map((f) => f.uid === bf.uid ? { ...f, status: 'error', errorMsg: err instanceof Error ? err.message : 'Network error' } : f))
      }
    }
    setBulkUploading(false)
    if (uploaded > 0) {
      toast.success(`${uploaded} wallpaper${uploaded > 1 ? 's' : ''} uploaded — publish when ready`)
    }
  }

  const publishUploadedBatch = async () => {
    const ids = bulkFiles.filter((f) => f.status === 'done' && f.wallpaperId).map((f) => f.wallpaperId!)
    if (!ids.length) { toast.error('No uploaded wallpapers to publish'); return }
    setBulkPublishing(true)
    try {
      const res = await fetch('/api/admin/wallpapers/bulk-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, published: true }),
      })
      if (res.ok) {
        toast.success(`${ids.length} wallpaper${ids.length > 1 ? 's' : ''} published`)
        router.push('/admin/wallpapers')
      } else {
        toast.error('Publish failed')
      }
    } finally {
      setBulkPublishing(false)
    }
  }

  const pendingCount = bulkFiles.filter((f) => f.status === 'pending').length
  const doneCount = bulkFiles.filter((f) => f.status === 'done').length
  const unpublishedDoneCount = bulkFiles.filter((f) => f.status === 'done' && f.wallpaperId).length

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {(['single', 'bulk'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            {t === 'single' ? 'Single upload' : 'Bulk upload'}
          </button>
        ))}
      </div>

      {/* Single upload */}
      {tab === 'single' && (
        <form onSubmit={handleUpload} className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
            <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)} onClick={() => fileRef.current?.click()}
              className={`flex w-36 cursor-pointer items-center justify-center rounded-[4px] border-2 border-dashed transition-colors ${dragOver ? 'border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--text-muted)]/40'}`}
              style={{ aspectRatio: '9/16' }}>
              {preview
                ? <img src={preview} alt="" className="h-full w-full object-cover rounded-[2px]" />
                : <span className="text-[10px] text-[var(--text-muted)] text-center px-2">Drop or click</span>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Midnight Sky" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Price (INR ₹)</label>
                  <input type="number" step="0.01" min="0.99" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className={inputClass} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c} className="bg-[#111]">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Tags</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="dark, moody" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={uploading || !file}
                  className="rounded-[4px] bg-[var(--accent)] px-5 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
                  {uploading ? 'Generating previews…' : 'Upload & save'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Bulk upload */}
      {tab === 'bulk' && (
        <div className="space-y-5">
          <div
            onDrop={onBulkDrop}
            onDragOver={(e) => { e.preventDefault(); setBulkDragOver(true) }}
            onDragLeave={() => setBulkDragOver(false)}
            onClick={() => bulkInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border-2 border-dashed py-10 transition-colors ${bulkDragOver ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--text-muted)]/40'}`}
          >
            <Upload className="h-6 w-6 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">Drop images here or <span className="text-[var(--accent)]">browse</span></p>
            <p className="text-[10px] text-[var(--text-muted)]/60">JPEG, PNG, WEBP — multiple files supported</p>
            <input ref={bulkInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files) addBulkFiles(e.target.files) }} />
          </div>

          {bulkFiles.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)]">
                  {bulkFiles.length} file{bulkFiles.length !== 1 ? 's' : ''} staged
                  {doneCount > 0 && <span className="text-emerald-400 ml-2">· {doneCount} uploaded</span>}
                </p>
              </div>
              <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="border-b border-[var(--border)]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-16">Preview</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Title</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-36">Category</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-24">Price ₹</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Tags</th>
                      <th className="px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] w-24">Status</th>
                      <th className="px-4 py-2.5 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {bulkFiles.map((bf) => (
                      <tr key={bf.uid} className="border-t border-[var(--border)]/50 hover:bg-[var(--surface-2)] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="h-20 w-11 overflow-hidden rounded-[2px] bg-[var(--surface-2)]">
                            <img src={bf.objectUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <input value={bf.title} onChange={(e) => updateBulkFile(bf.uid, { title: e.target.value })}
                            disabled={bf.status !== 'pending'} className={inputSm} placeholder="Title" />
                        </td>
                        <td className="px-4 py-2.5">
                          <select value={bf.category} onChange={(e) => updateBulkFile(bf.uid, { category: e.target.value })}
                            disabled={bf.status !== 'pending'} className={inputSm}>
                            {CATEGORIES.map((c) => <option key={c} className="bg-[#111]">{c}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <input type="number" value={bf.price} onChange={(e) => updateBulkFile(bf.uid, { price: e.target.value })}
                            disabled={bf.status !== 'pending'} className={inputSm} min="0" />
                        </td>
                        <td className="px-4 py-2.5">
                          <input value={bf.tags} onChange={(e) => updateBulkFile(bf.uid, { tags: e.target.value })}
                            disabled={bf.status !== 'pending'} className={inputSm} placeholder="dark, moody" />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {bf.status === 'pending' && <span className="text-[var(--text-muted)]">Pending</span>}
                          {bf.status === 'uploading' && <span className="inline-flex items-center gap-1 text-[var(--accent)]"><Loader2 className="h-3 w-3 animate-spin" /> Uploading</span>}
                          {bf.status === 'done' && <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Done</span>}
                          {bf.status === 'error' && <span className="inline-flex items-center gap-1 text-red-400" title={bf.errorMsg}><AlertCircle className="h-3 w-3" /> Failed</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {bf.status === 'pending' && (
                            <button onClick={() => removeBulkFile(bf.uid)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={uploadAllBulk} disabled={bulkUploading || bulkPublishing || pendingCount === 0}
                  className="rounded-[4px] bg-[var(--accent)] px-5 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors flex items-center gap-2">
                  {bulkUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {bulkUploading ? 'Uploading…' : `Upload ${pendingCount > 0 ? pendingCount : ''} file${pendingCount !== 1 ? 's' : ''}`}
                </button>
                {unpublishedDoneCount > 0 && !bulkUploading && (
                  <button onClick={publishUploadedBatch} disabled={bulkPublishing}
                    className="rounded-[4px] border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10 px-5 py-2 text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-2">
                    {bulkPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {bulkPublishing ? 'Publishing…' : `Publish ${unpublishedDoneCount} uploaded`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
