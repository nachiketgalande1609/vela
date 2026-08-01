import { verifySession, getUser } from '@/lib/auth/dal'
import { redirect } from 'next/navigation'
import { Sidebar } from './Sidebar'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  if (!session) redirect('/auth/login')

  const user = await getUser(session.id)
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="pl-60">
        {children}
      </div>
    </div>
  )
}
