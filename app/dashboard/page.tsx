import { requireAuth, getUser } from '@/lib/auth/dal'
import { AppShell } from '@/app/components/layout/AppShell'
import { LogoutAllButton } from '@/app/components/auth/LogoutButton'
import { ShieldCheck, MailCheck, CalendarDays, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const session = await requireAuth()
  const user = await getUser(session.id)

  const stats = [
    { icon: ShieldCheck,  label: 'Role',           value: user?.role ?? '—',          color: 'indigo' },
    { icon: MailCheck,    label: 'Email verified',  value: user?.emailVerified ? 'Verified' : 'Pending', color: user?.emailVerified ? 'green' : 'amber' },
    { icon: CalendarDays, label: 'Member since',    value: user?.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—', color: 'slate' },
  ]

  const colorMap: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600'  },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600'  },
    slate:  { bg: 'bg-slate-100', icon: 'text-slate-500'  },
  }

  return (
    <AppShell>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">Welcome back, {user?.name ?? user?.email}</p>
      </div>

      <div className="space-y-6 p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value, color }) => {
            const c = colorMap[color]
            return (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
                  <Icon className={`h-[18px] w-[18px] ${c.icon}`} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
              </div>
            )
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <Clock className="h-[18px] w-[18px] text-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Session management</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Revoke all active sessions across every device. Use this if you suspect your account has been compromised.
              </p>
            </div>
          </div>
          <LogoutAllButton />
        </div>
      </div>
    </AppShell>
  )
}
