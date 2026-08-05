'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { WallpaperCard, WallpaperCardData } from '@/app/components/wallpapers/WallpaperCard'

interface SearchClientProps {
  initialQuery: string
}

export function SearchClient({ initialQuery }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery)
  const [wallpapers, setWallpapers] = useState<WallpaperCardData[]>([])
  const [initialLoading, setInitialLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [total, setTotal] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageRef = useRef(1)
  const hasMoreRef = useRef(false)
  const fetchingRef = useRef(false)
  const queryRef = useRef(initialQuery)

  const fetchPage = useCallback(async (q: string, pg: number) => {
    if (!q.trim()) {
      setWallpapers([])
      setSearched(false)
      setTotal(0)
      hasMoreRef.current = false
      return
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${pg}`)
    const data = await res.json() as { wallpapers: WallpaperCardData[]; total: number; pages: number }
    const incoming = data.wallpapers ?? []
    setWallpapers((prev) => pg === 1 ? incoming : [...prev, ...incoming])
    setTotal(data.total)
    hasMoreRef.current = pg < (data.pages ?? 1)
    setSearched(true)
  }, [])

  // Initial load
  useEffect(() => {
    inputRef.current?.focus()
    if (initialQuery) {
      pageRef.current = 1
      setInitialLoading(true)
      fetchPage(initialQuery, 1).finally(() => setInitialLoading(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        if (fetchingRef.current || !hasMoreRef.current) return
        fetchingRef.current = true
        const next = pageRef.current + 1
        pageRef.current = next
        setLoadingMore(true)
        fetchPage(queryRef.current, next).finally(() => {
          fetchingRef.current = false
          setLoadingMore(false)
        })
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchPage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    queryRef.current = val
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pageRef.current = 1
      hasMoreRef.current = false
      setInitialLoading(true)
      fetchPage(val, 1).finally(() => setInitialLoading(false))
    }, 300)
  }

  const clear = () => {
    setQuery('')
    queryRef.current = ''
    setWallpapers([])
    setSearched(false)
    setTotal(0)
    hasMoreRef.current = false
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search by title, category or tags…"
          className="w-full rounded-[4px] border border-white/8 bg-white/5 py-2.5 pl-9 pr-9 text-sm text-[var(--text)] placeholder:text-white/30 outline-none focus:border-[var(--accent)]/50 focus:bg-white/8 transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Result count */}
      {searched && !initialLoading && (
        <p className="text-xs text-[var(--text-muted)]">
          {total === 0 ? `No results for "${query}"` : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
        </p>
      )}

      {/* Skeleton */}
      {initialLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-[4px] bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {/* Results grid */}
      {!initialLoading && wallpapers.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {wallpapers.map(w => (
            <WallpaperCard key={w.id} wallpaper={w} isAuthenticated={false} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && !searched && !query && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Search size={36} className="text-[var(--text-muted)]/30" />
          <p className="text-sm text-[var(--text-muted)]">Start typing to search wallpapers</p>
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {loadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
        </div>
      )}

      {searched && !initialLoading && !hasMoreRef.current && !loadingMore && wallpapers.length > 0 && (
        <p className="py-6 text-center text-xs text-[var(--text-muted)]">You&apos;ve seen everything</p>
      )}
    </div>
  )
}
