'use client'
import Image from 'next/image'
import Link from 'next/link'
import { DownloadButton } from '@/app/components/wallpapers/DownloadButton'

interface PurchasedWallpaper {
  purchaseId: string
  wallpaper: { id: string; title: string; thumbPath: string; category: string }
}

export function PurchasedGrid({ purchases }: { purchases: PurchasedWallpaper[] }) {
  if (purchases.length === 0) {
    return (
      <div className="py-10 text-center space-y-3">
        <p className="text-sm text-[var(--text-muted)]">You haven&apos;t purchased any wallpapers yet.</p>
        <Link
          href="/"
          className="inline-block text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          Browse the collection →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {purchases.map(({ wallpaper, purchaseId }) => (
        <div key={purchaseId} className="rounded-[4px] border border-[var(--border)] overflow-hidden bg-[var(--surface-2)]">
          <Link href={`/wallpapers/${wallpaper.id}`}>
            <div className="relative aspect-[9/16]">
              <Image
                src={wallpaper.thumbPath}
                alt={wallpaper.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </Link>
          <div className="p-3 space-y-2">
            <div>
              <p className="text-xs font-medium text-[var(--text)] truncate">{wallpaper.title}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{wallpaper.category}</p>
            </div>
            <DownloadButton
              wallpaperId={wallpaper.id}
              className="w-full justify-center text-xs py-1.5 px-3"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
