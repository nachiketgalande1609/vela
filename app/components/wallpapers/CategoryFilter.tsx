'use client'

const CATEGORIES = ['All', 'Abstract', 'Nature', 'Dark', 'Minimal', 'Architecture', 'Neon']

interface CategoryFilterProps {
  selected: string
  onChange: (category: string) => void
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 rounded-[4px] px-4 py-1.5 text-xs font-medium transition-colors duration-150 ${
            selected === cat
              ? 'bg-[var(--accent)] text-black'
              : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export { CATEGORIES }
