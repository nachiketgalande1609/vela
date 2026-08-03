import { requireAdmin } from '@/lib/auth/dal'
import { PublicNav } from '@/app/components/layout/PublicNav'
import { PageHeader } from '@/app/components/layout/PageHeader'
import { prisma } from '@/lib/db/prisma'
import { Users, MonitorSmartphone } from 'lucide-react'

export const metadata = { title: 'Admin — Vela' }

export default async function AdminPage() {
  await requireAdmin()

  const [userCount, sessionCount, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, email: true, name: true, role: true, emailVerified: true, createdAt: true },
    }),
  ])

  const stats = [
    { icon: Users,             label: 'Total users',     value: userCount    },
    { icon: MonitorSmartphone, label: 'Active sessions', value: sessionCount },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <PublicNav />

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        <PageHeader
          title="Admin Panel"
          subtitle="User management and system overview"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }]}
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--surface-2)]">
                <Icon className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
              <p className="mt-1 text-3xl font-bold text-[var(--text)]">{value}</p>
            </div>
          ))}
        </div>

        {/* Recent users */}
        <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">Recent users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['User', 'Role', 'Status', 'Joined'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs font-bold text-[var(--accent)]">
                          {(u.name ?? u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text)]">{u.name ?? '—'}</p>
                          <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-[4px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide
                        ${u.role === 'ADMIN'
                          ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                          : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-[4px] px-2 py-0.5 text-[10px] font-medium
                        ${u.emailVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {u.emailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                      {u.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
