'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Image from 'next/image'

interface Result {
  id: string
  title: string
  price: number
  category: string
  thumbPath: string
  isFree: boolean
}

export function NavSearch() {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (pathname === '/search') return null

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=1`)
      const data = await res.json() as { wallpapers: Result[] }
      setResults(data.wallpapers?.slice(0, 6) ?? [])
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchResults])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const clear = () => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }

  const goTo = (id: string) => {
    setOpen(false)
    setQuery('')
    router.push(`/wallpapers/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div ref={containerRef} className="relative hidden lg:flex flex-1 mx-6">
      <div className="relative w-full">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Search wallpapers…"
          className="w-full rounded-[4px] border border-white/8 bg-white/5 py-1.5 pl-8 pr-8 text-sm text-[var(--text)] placeholder:text-white/30 outline-none focus:border-[var(--accent)]/50 focus:bg-white/8 transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-[4px] border border-[var(--border)] bg-[#0A0A0A]/95 backdrop-blur-md shadow-xl overflow-hidden z-50">
          {loading && (
            <div className="px-4 py-3 text-xs text-[var(--text-muted)]">Searching…</div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div className="px-4 py-3 text-xs text-[var(--text-muted)]">No results for "{query}"</div>
          )}
          {!loading && results.map((r) => (
            <button
              key={r.id}
              onClick={() => goTo(r.id)}
              className="flex w-full items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
            >
              <div className="relative h-10 w-7 flex-shrink-0 rounded-[2px] overflow-hidden">
                <Image src={r.thumbPath} alt={r.title} fill className="object-cover" sizes="28px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-[var(--text)]">{r.title}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{r.category}</p>
              </div>
              <span className="text-xs text-[var(--accent)] shrink-0">
                {r.isFree ? 'Free' : `₹${r.price.toFixed(0)}`}
              </span>
            </button>
          ))}
          {!loading && results.length > 0 && (
            <button
              onClick={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(query.trim())}`) }}
              className="w-full px-4 py-2.5 text-xs text-[var(--accent)] hover:bg-white/5 transition-colors text-left border-t border-[var(--border)]"
            >
              See all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
