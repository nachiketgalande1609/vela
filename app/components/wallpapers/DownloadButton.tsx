'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Loader2 } from 'lucide-react'

interface DownloadButtonProps {
  wallpaperId: string
  className?: string
}

export function DownloadButton({ wallpaperId, className }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (loading) return
    setLoading(true)
    try {
      const tokenRes = await fetch(`/api/wallpapers/${wallpaperId}/download`, { method: 'POST' })
      const tokenData = await tokenRes.json() as { token?: string; error?: string }

      if (!tokenRes.ok || !tokenData.token) {
        toast.error(tokenData.error ?? 'Download failed')
        return
      }

      window.location.href = `/api/wallpapers/${wallpaperId}/stream?token=${tokenData.token}`
    } catch {
      toast.error('Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Fixed top-right indicator while download is preparing */}
      {loading && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-lg">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
          <span className="text-xs text-[var(--text-muted)]">Download starting…</span>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={loading}
        className={`
          flex items-center gap-2 rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-5 py-2.5
          cursor-pointer
          md:hover:bg-[var(--accent-hover)] md:transition-colors
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className ?? ''}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            Preparing…
          </>
        ) : (
          <>
            <Download className="h-4 w-4 shrink-0" />
            Download
          </>
        )}
      </button>
    </>
  )
}
