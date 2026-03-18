'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import * as React from 'react'
import { LayoutDashboard, Users, Box, ShoppingBag, BarChart3, Settings, Menu, X, LogOut } from 'lucide-react'

import { cn } from '@/lib/utils'

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Box },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  // Close sidebar on navigation on mobile
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brown flex items-center justify-between px-4 z-40 border-b border-white/10">
        <Link href="/" className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
          <Image src="/logo.svg" alt="EcoGear Logo" width={24} height={24} className="w-auto h-6 brightness-0 invert opacity-90" />
          EcoGear
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-white p-2 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 border-r border-black/10 bg-brown text-white z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-[72px] items-center px-6 border-b border-white/10 md:border-0 justify-between md:justify-start">
          <Link href="/" className="font-bold text-2xl tracking-tight text-primary flex items-center gap-2 pr-2">
            <Image src="/logo.svg" alt="EcoGear Logo" width={32} height={32} className="w-auto h-8 brightness-0 invert opacity-90" />
            EcoGear
          </Link>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-white/70 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-4 py-4 space-y-1 overflow-y-auto h-[calc(100vh-72px)]">
          {items.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-primary text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-black' : 'text-white/70')} />
                {item.label}
              </Link>
            )
          })}
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors mt-8"
          >
            <LogOut className="h-5 w-5 text-white/70" />
            Log Out
          </button>
        </nav>
      </aside>
    </>
  )
}

