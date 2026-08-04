import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { CreatePackClient } from './CreatePackClient'

export const metadata = { title: 'Admin — Create Pack' }

export default async function CreatePackPage() {
  await requireAdmin()

  const wallpapers = await prisma.wallpaper.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, thumbPath: true, category: true },
  })

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader
          title="Create Pack"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Packs', href: '/admin/packs' },
            { label: 'Create' },
          ]}
        />
        <CreatePackClient wallpapers={wallpapers} />
      </div>
    </div>
  )
}
