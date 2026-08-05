import { requireAdmin } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { UploadClient } from './UploadClient'

export const metadata = { title: 'Upload Wallpapers' }

export default async function UploadPage() {
  await requireAdmin()
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader
          title="Upload Wallpapers"
          subtitle="Add single or multiple wallpapers to your library."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Wallpapers', href: '/admin/wallpapers' },
            { label: 'Upload' },
          ]}
        />
        <UploadClient />
      </div>
    </div>
  )
}
