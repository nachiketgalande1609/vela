'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { WallpaperCard, WallpaperCardData } from '@/app/components/wallpapers/WallpaperCard'

interface SearchClientProps {
  initialQuery: string
}

export function SearchClient({ initialQuery }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery)
  const [wallpapers, setWallpapers] = useState<WallpaperCardData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchResults = useCallback(async (q: string, pg: number, append = false) => {
    if (!append) setLoading(true)
    else setLoadingMore(true)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${pg}`)
      const data = await res.json()
      setWallpapers(prev => append ? [...prev, ...data.wallpapers] : data.wallpapers)
      setTotal(data.total)
      setPages(data.pages)
      setPage(pg)
    } finally {
      if (!append) setLoading(false)
      else setLoadingMore(false)
    }
  }, [])

  // Initial fetch if there's a query
  useEffect(() => {
    if (initialQuery) {
      fetchResults(initialQuery, 1)
    }
    inputRef.current?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchResults(val, 1)
    }, 300)
  }

  const handleLoadMore = () => {
    if (page < pages) {
      fetchResults(query, page + 1, true)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search wallpapers..."
        className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors mb-6"
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[9/16] rounded-[4px] bg-[var(--surface)] animate-pulse"
            />
          ))}
        </div>
      ) : wallpapers.length === 0 && query ? (
        <p className="text-sm text-[var(--text-muted)]">No results for &ldquo;{query}&rdquo;</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {wallpapers.map(w => (
              <WallpaperCard key={w.id} wallpaper={w} isAuthenticated={false} />
            ))}
          </div>

          {page < pages && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : `Load more (${total - wallpapers.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
