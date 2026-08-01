import { requireAuth, getUser } from '@/lib/auth/dal'
import { AppShell } from '@/app/components/layout/AppShell'
import { User, Mail, ShieldCheck, CalendarDays, BadgeCheck } from 'lucide-react'

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
    <AppShell>
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-xl font-semibold text-neutral-900">Profile</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Your account details</p>
      </div>

      <div className="max-w-2xl space-y-6 p-8">
        {/* Avatar card */}
        <div className="flex items-center gap-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white ring-4 ring-neutral-100">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-900">{user.name ?? 'User'}</p>
            <p className="text-sm text-neutral-500">{user.email}</p>
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
              ${user.role === 'ADMIN' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                <Icon className="h-4 w-4 text-neutral-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-neutral-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
