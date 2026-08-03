'use client'
import { useState, useEffect, useCallback } from 'react'
import { WallpaperCard, type WallpaperCardData } from '@/app/components/wallpapers/WallpaperCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WallpaperBrowseProps {
  isAuthenticated: boolean
}

interface AccessData {
  hasSubscription: boolean
  ownedIds: string[]
}

export function WallpaperBrowse({ isAuthenticated }: WallpaperBrowseProps) {
  const [wallpapers, setWallpapers] = useState<WallpaperCardData[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [access, setAccess] = useState<AccessData>({ hasSubscription: false, ownedIds: [] })

  const fetchWallpapers = useCallback(async (pg: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/wallpapers?page=${pg}`)
      if (!res.ok) { setWallpapers([]); setPages(0); return }
      const data = await res.json() as { wallpapers: WallpaperCardData[]; pages: number }
      setWallpapers(data.wallpapers ?? [])
      setPages(data.pages ?? 0)
    } catch {
      setWallpapers([])
      setPages(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchWallpapers(page) }, [page, fetchWallpapers])

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/user/access')
      .then((r) => r.json() as Promise<AccessData>)
      .then(setAccess)
      .catch(() => {/* leave defaults */})
  }, [isAuthenticated])

  const isOwned = (id: string) => access.hasSubscription || access.ownedIds.includes(id)

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-[4px] bg-[var(--surface)] animate-pulse" style={{ aspectRatio: '9/16' }} />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="py-24 text-center text-[var(--text-muted)] text-sm">
          No wallpapers available yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {wallpapers.map((w) => (
            <WallpaperCard
              key={w.id}
              wallpaper={w}
              isAuthenticated={isAuthenticated}
              owned={isOwned(w.id)}
            />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-[4px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-[var(--text-muted)]">Page {page} of {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="flex items-center gap-1 rounded-[4px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)] disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
