import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { AdminPacksClient } from './AdminPacksClient'

export const metadata = { title: 'Admin — Packs' }

export default async function AdminPacksPage() {
  await requireAdmin()

  const packs = await prisma.pack.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, price: true, published: true, createdAt: true,
      _count: { select: { wallpapers: true, purchases: true } },
    },
  })

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Packs"
            breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin' }, { label: 'Packs' }]}
          />
          <Link
            href="/admin/packs/create"
            className="rounded-[4px] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-hover)] transition-colors"
          >
            + New Pack
          </Link>
        </div>
        <AdminPacksClient packs={packs} />
      </div>
    </div>
  )
}
