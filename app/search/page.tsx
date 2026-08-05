import { PublicNav } from '@/app/components/layout/PublicNav'
import { SearchClient } from './SearchClient'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-7xl px-3 pt-4 pb-6 sm:px-6 sm:py-8">
        <h1 className="mb-6 text-xl font-semibold text-[var(--text)]">
          {q ? `Search results for "${q}"` : 'Search'}
        </h1>
        <SearchClient initialQuery={q} />
      </main>
    </>
  )
}
