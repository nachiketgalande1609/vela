'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { WallpaperCard, type WallpaperCardData } from '@/app/components/wallpapers/WallpaperCard'
import { Loader2 } from 'lucide-react'

interface WallpaperBrowseProps {
  isAuthenticated: boolean
  category?: string
}

interface AccessData {
  hasSubscription: boolean
  ownedIds: string[]
}

export function WallpaperBrowse({ isAuthenticated, category }: WallpaperBrowseProps) {
  const [wallpapers, setWallpapers] = useState<WallpaperCardData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [access, setAccess] = useState<AccessData>({ hasSubscription: false, ownedIds: [] })
  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchPage = useCallback(async (pg: number) => {
    try {
      const qs = category ? `page=${pg}&category=${encodeURIComponent(category)}` : `page=${pg}`
      const res = await fetch(`/api/wallpapers?${qs}`)
      if (!res.ok) return
      const data = await res.json() as { wallpapers: WallpaperCardData[]; pages: number }
      const incoming = data.wallpapers ?? []
      setWallpapers((prev) => pg === 1 ? incoming : [...prev, ...incoming])
      setHasMore(pg < (data.pages ?? 1))
    } catch { /* leave state */ }
  }, [])

  // Initial load
  useEffect(() => {
    setLoading(true)
    fetchPage(1).finally(() => setLoading(false))
  }, [fetchPage])

  // Intersection observer — triggers when sentinel enters viewport
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setPage((prev) => {
            const next = prev + 1
            setLoadingMore(true)
            fetchPage(next).finally(() => setLoadingMore(false))
            return next
          })
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, fetchPage])

  // Access data
  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/user/access')
      .then((r) => r.json() as Promise<AccessData>)
      .then(setAccess)
      .catch(() => {})
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
        <>
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

          {/* Sentinel — observed to trigger next page load */}
          <div ref={sentinelRef} className="h-1" />

          {loadingMore && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
            </div>
          )}

          {!hasMore && wallpapers.length > 0 && (
            <p className="py-8 text-center text-xs text-[var(--text-muted)]">
              You&apos;ve seen everything
            </p>
          )}
        </>
      )}
    </div>
  )
}
