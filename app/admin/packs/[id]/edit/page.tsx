import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { EditPackClient } from './EditPackClient'

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const pack = await prisma.pack.findUnique({ where: { id }, select: { title: true } })
  return { title: `Edit ${pack?.title ?? 'Pack'} — Admin` }
}

export default async function EditPackPage({ params }: PageProps) {
  await requireAdmin()
  const { id } = await params

  const [pack, wallpapers] = await Promise.all([
    prisma.pack.findUnique({
      where: { id },
      select: {
        id: true, title: true, description: true, price: true,
        wallpapers: {
          orderBy: { order: 'asc' },
          select: { wallpaper: { select: { id: true } } },
        },
      },
    }),
    prisma.wallpaper.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, thumbPath: true, category: true },
    }),
  ])

  if (!pack) notFound()

  const packData = {
    id: pack.id,
    title: pack.title,
    description: pack.description ?? '',
    price: pack.price,
    wallpaperIds: pack.wallpapers.map((w) => w.wallpaper.id),
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader
          title="Edit Pack"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Packs', href: '/admin/packs' },
            { label: 'Edit' },
          ]}
        />
        <EditPackClient pack={packData} wallpapers={wallpapers} />
      </div>
    </div>
  )
}
