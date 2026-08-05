export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { verifySession } from '@/lib/auth/dal'
import { CATEGORIES } from '@/lib/categories'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { WallpaperBrowse } from '@/app/wallpapers/WallpaperBrowse'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params
  const label = CATEGORIES.find((c) => c.toLowerCase() === decodeURIComponent(category).toLowerCase())
  if (!label) return { title: 'Not Found' }
  return { title: `${label} Wallpapers` }
}

export default async function GenrePage({ params }: PageProps) {
  const { category } = await params
  const label = CATEGORIES.find((c) => c.toLowerCase() === decodeURIComponent(category).toLowerCase())
  if (!label) notFound()

  const session = await verifySession()

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <WallpaperBrowse isAuthenticated={!!session} category={label} />
    </div>
  )
}
