import { requireAdmin } from '@/lib/auth/dal'
import { AppShell } from '@/app/components/layout/AppShell'
import { prisma } from '@/lib/db/prisma'
import { Users, MonitorSmartphone } from 'lucide-react'

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

  return (
    <AppShell>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Admin panel</h1>
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Admin</span>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">User management and system overview</p>
      </div>

      <div className="space-y-6 p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Users,            label: 'Total users',    value: userCount,    bg: 'bg-indigo-50', color: 'text-indigo-600' },
            { icon: MonitorSmartphone,label: 'Active sessions',value: sessionCount, bg: 'bg-green-50',  color: 'text-green-600'  },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-[18px] w-[18px] ${color}`} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Recent users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['User', 'Role', 'Status', 'Joined'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {(u.name ?? u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.name ?? '—'}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${u.emailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {u.emailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
