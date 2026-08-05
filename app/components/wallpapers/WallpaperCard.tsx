'use client'
import Link from 'next/link'
import { PreviewImage } from './PreviewImage'
import { useNavigationLoading } from '@/app/components/providers/NavigationLoadingProvider'
import { WishlistButton } from './WishlistButton'
import { AddToCartButton } from '@/app/components/cart/AddToCartButton'

export interface WallpaperCardData {
  id: string
  title: string
  price: number
  category: string
  thumbPath: string
  isFree?: boolean
  wishlisted?: boolean
}

interface WallpaperCardProps {
  wallpaper: WallpaperCardData
  isAuthenticated: boolean
  owned?: boolean
  wishlisted?: boolean
}

export function WallpaperCard({ wallpaper, isAuthenticated, owned = false, wishlisted }: WallpaperCardProps) {
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

        <div className="absolute top-3 right-3">
          {owned ? (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">
              Owned
            </span>
          ) : !wallpaper.isFree ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--accent)" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L9 8 3 6l3 7H18l3-7-6 2-3-6zM5 15v2h14v-2H5z"/>
            </svg>
          ) : null}
        </div>

        <div className="absolute bottom-2 left-2 flex gap-1.5" onClick={(e) => e.preventDefault()}>
          <WishlistButton
            wallpaperId={wallpaper.id}
            initialWishlisted={wishlisted}
            isAuthenticated={isAuthenticated}
          />
          <AddToCartButton
            wallpaperId={wallpaper.id}
            isAuthenticated={isAuthenticated}
            owned={owned}
            isFree={wallpaper.isFree}
          />
        </div>
      </div>
    </Link>
  )
}
