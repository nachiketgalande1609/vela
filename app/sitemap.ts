import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db/prisma'

const BASE = 'https://vela.nachiketgalande.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/wallpapers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/packs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/license`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/refund-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  // Dynamic wallpaper pages
  let wallpaperPages: MetadataRoute.Sitemap = []
  try {
    const wallpapers = await prisma.wallpaper.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    })
    wallpaperPages = wallpapers.map((w) => ({
      url: `${BASE}/wallpapers/${w.id}`,
      lastModified: w.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {}

  // Dynamic pack pages
  let packPages: MetadataRoute.Sitemap = []
  try {
    const packs = await prisma.pack.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    })
    packPages = packs.map((p) => ({
      url: `${BASE}/packs/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {}

  return [...static_pages, ...wallpaperPages, ...packPages]
}
