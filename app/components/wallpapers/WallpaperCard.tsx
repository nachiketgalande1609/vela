'use client'
import Link from 'next/link'
import { useState } from 'react'
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

export function WallpaperCard({ wallpaper, isAuthenticated, owned = false }: WallpaperCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/wallpapers/${wallpaper.id}`}>
      <div
        className={`relative rounded-[4px] border border-[var(--border)] overflow-hidden cursor-pointer transition-colors duration-200 ${hovered ? 'border-[var(--accent)]/40 wallpaper-card-hover' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <PreviewImage
          src={wallpaper.thumbPath}
          alt={wallpaper.title}
          width={400}
          height={711}
          className="w-full"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        <div
          className={`absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
        >
          {!isAuthenticated && (
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Sign in to purchase</p>
          )}
          <p className="text-xs font-semibold text-[var(--text)] truncate">{wallpaper.title}</p>
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
      </div>
    </Link>
  )
}
