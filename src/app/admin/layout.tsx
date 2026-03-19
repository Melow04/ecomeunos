import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Footer } from '@/components/layout/Footer'
import { auth } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#f9f9f9]">
      {/* Top Header */}
      <header className="h-[72px] bg-white border-b border-black/5 flex items-center px-4 sm:px-8">
        <Link href="/admin" className="flex items-center gap-2 font-black text-2xl tracking-tight text-black">
          <Image src="/logo.svg" alt="EcoGear Logo" width={48} height={48} className="w-auto h-12" />
          EcoGear
        </Link>
      </header>

      {/* Sub Header */}
      <div className="h-[72px] bg-white border-b border-black/5 flex items-center justify-between px-4 sm:px-8">
        <h1 className="text-[26px] font-extrabold text-black tracking-tight">Admin Dashboard</h1>
        <Link href="/" className="text-[#849073] font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>

      <div className="flex-1 w-full p-4 sm:p-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-[260px] shrink-0">
          <AdminSidebar />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  )
}
