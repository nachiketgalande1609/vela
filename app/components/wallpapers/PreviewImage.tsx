'use client'
import Image from 'next/image'

interface PreviewImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  sizes?: string
  priority?: boolean
}

export function PreviewImage({ src, alt, width, height, className, sizes, priority }: PreviewImageProps) {
  return (
    <div className={`relative overflow-hidden select-none ${className ?? ''}`} style={{ aspectRatio: `${width}/${height}` }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 768px) 50vw, 33vw'}
        priority={priority}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="wallpaper-preview object-cover"
        style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      />
    </div>
  )
}
