'use client'
import Link from 'next/link'
import { PreviewImage } from './PreviewImage'
import { useNavigationLoading } from '@/app/components/providers/NavigationLoadingProvider'

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
  const { startLoading } = useNavigationLoading()

  return (
    <Link href={`/wallpapers/${wallpaper.id}`} onClick={startLoading}>
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
      </div>
    </Link>
  )
}
