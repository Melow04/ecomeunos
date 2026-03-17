import { redirect } from 'next/navigation'

import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { auth } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-dvh">
      <AdminSidebar />
      <main className="ml-64 px-6 py-8">{children}</main>
    </div>
  )
}
