'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { PreviewImage } from './PreviewImage'

export interface WallpaperCardData {
  id: string
  title: string
  price: number
  category: string
  thumbPath: string
}

interface WallpaperCardProps {
  wallpaper: WallpaperCardData
  isAuthenticated: boolean
  owned?: boolean
}

export function WallpaperCard({ wallpaper, owned = false }: WallpaperCardProps) {
  const [loading, setLoading] = useState(false)

  return (
    <Link href={`/wallpapers/${wallpaper.id}`} onClick={() => setLoading(true)}>
      <div className="relative rounded-[4px] border border-[var(--border)] overflow-hidden cursor-pointer group active:opacity-70 transition-opacity">
        <div className="transition-transform duration-500 ease-out group-hover:scale-105 will-change-transform">
          <PreviewImage
            src={wallpaper.thumbPath}
            alt={wallpaper.title}
            width={400}
            height={711}
            className="w-full"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div className="absolute top-2 right-2">
          {owned ? (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">
              Owned
            </span>
          ) : (
            <span className="bg-[var(--accent)] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">
              ₹{wallpaper.price.toFixed(0)}
            </span>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
          </div>
        )}
      </div>
    </Link>
  )
}
