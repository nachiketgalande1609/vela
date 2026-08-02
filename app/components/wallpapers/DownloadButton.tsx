'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Download } from 'lucide-react'

interface DownloadButtonProps {
  wallpaperId: string
  className?: string
}

export function DownloadButton({ wallpaperId, className }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const tokenRes = await fetch(`/api/wallpapers/${wallpaperId}/download`, { method: 'POST' })
      const tokenData = await tokenRes.json() as { token?: string; error?: string }

      if (!tokenRes.ok || !tokenData.token) {
        toast.error(tokenData.error ?? 'Download failed')
        return
      }

      const fileRes = await fetch(`/api/wallpapers/${wallpaperId}/stream?token=${tokenData.token}`)
      if (!fileRes.ok) {
        toast.error('Could not retrieve file')
        return
      }

      const blob = await fileRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vela-wallpaper.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch {
      toast.error('Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`flex items-center gap-2 rounded-[4px] bg-[var(--accent)] text-black font-medium text-sm px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className ?? ''}`}
    >
      <Download className="h-4 w-4 shrink-0" />
      {loading ? 'Preparing…' : 'Download'}
    </button>
  )
}
