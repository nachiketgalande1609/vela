import { requireAdmin } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { UploadClient } from './UploadClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Upload Wallpapers — Vela' }

export default async function UploadPage() {
  await requireAdmin()
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <Link href="/admin/wallpapers"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to wallpapers
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Upload Wallpapers
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Add single or multiple wallpapers to your library.</p>
        </div>
        <UploadClient />
      </div>
    </div>
  )
}
