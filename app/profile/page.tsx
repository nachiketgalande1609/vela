import { requireAuth, getUser } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { User, Mail, ShieldCheck, CalendarDays, BadgeCheck } from 'lucide-react'

export const metadata = { title: 'Profile — Vela' }

export default async function ProfilePage() {
  const session = await requireAuth()
  const user = await getUser(session.id)
  if (!user) return null

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase()

  const rows = [
    { icon: User,         label: 'Full name',     value: user.name ?? '—' },
    { icon: Mail,         label: 'Email',          value: user.email },
    { icon: ShieldCheck,  label: 'Role',           value: user.role },
    { icon: BadgeCheck,   label: 'Email verified', value: user.emailVerified ? `Yes — ${user.emailVerified.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Not yet verified' },
    { icon: CalendarDays, label: 'Member since',   value: user.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Profile
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Your account details</p>
        </div>

        {/* Avatar card */}
        <div className="mb-4 flex items-center gap-5 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-xl font-bold text-[var(--accent)]">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text)]">{user.name ?? 'User'}</p>
            <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
            <span className={`mt-2 inline-flex rounded-[4px] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide
              ${user.role === 'ADMIN'
                ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="overflow-hidden rounded-[4px] border border-[var(--border)] bg-[var(--surface)]">
          {rows.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[var(--surface-2)]">
                <Icon className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
                <p className="mt-0.5 truncate text-sm text-[var(--text)]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
