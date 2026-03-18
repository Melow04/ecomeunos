import { redirect } from 'next/navigation'

import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { auth } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-dvh flex md:block">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 px-4 sm:px-6 py-8 mt-16 md:mt-0 max-w-[100vw] overflow-x-hidden">{children}</main>
    </div>
  )
}
