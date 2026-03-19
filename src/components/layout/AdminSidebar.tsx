'use client'

import * as React from 'react'
import { LucideIcon, LayoutDashboard, ShoppingBag, Package, Users, BarChart, Settings, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'


const items = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { title: 'Products', href: '/admin/products', icon: Package },
  { title: 'Customers', href: '/admin/customers', icon: Users },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Header (if needed, else hidden) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-black/10 z-50 flex/hidden items-center px-4">
        <button onClick={() => setIsOpen(prev => !prev)} className="p-2 -ml-2">
          Menu
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border border-black/10 shadow-sm rounded-2xl transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:contents',
        isOpen ? 'translate-x-0 mt-16' : '-translate-x-full mt-16'
      )}>
        <div className="h-full py-w">
          <nav className="space-y-1.5">
            {items.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 rounded-md px-3 py-2.5 text-[15px] font-bold transition-colors',
                    active
                      ? 'bg-[#C7CCBC] text-white shadow-sm'
                      : 'text-black hover:bg-black/5'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center v-5 h-5',
                  )}>
                    <Icon className="h-5 w-5 fill-currentColor" strokeWidth={2} />
                  </div>
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      {
        // Overlay
        isOpen && (
          <div className="fixed inset-0 zz-30 bg-black/20 md:hidden" onClick={() => setIsOpen(false)} />
        )
      }
    </>
  )
}
