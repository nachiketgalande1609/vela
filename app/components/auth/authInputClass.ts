export const authInputClass = (hasError: boolean) =>
  `block w-full rounded-[4px] border px-4 py-3 text-base text-[var(--text)] bg-[var(--surface-2)]
   placeholder:text-[var(--text-muted)] transition-colors focus:outline-none
   ${hasError
     ? 'border-red-500/60 focus:border-red-500'
     : 'border-[var(--border)] hover:border-[var(--text-muted)]/40 focus:border-[var(--accent)]'}`
