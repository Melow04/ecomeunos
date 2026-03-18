'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart, ShoppingCart, User } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'

function getGuestCount() {
  if (typeof window === 'undefined') return 0
  const raw = window.localStorage.getItem('eunos_guest_cart')
  if (!raw) return 0
  try {
    const parsed = JSON.parse(raw) as Array<{ quantity: number }>
    return parsed.reduce((sum, i) => sum + (i.quantity || 0), 0)
  } catch {
    return 0
  }
}

export function Navbar() {
  const { data: session } = useSession()
  const [guestCount, setGuestCount] = React.useState(0)

  React.useEffect(() => {
    setGuestCount(getGuestCount())
    const onStorage = () => setGuestCount(getGuestCount())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="font-bold text-lg tracking-tight text-brown">
            EcoGear
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-brown/70 md:flex">
            <Link href="/products?category=camping" className="hover:text-brown transition-colors">
              Camping
            </Link>
            <Link href="/products?category=hiking" className="hover:text-brown transition-colors">
              Hiking
            </Link>
            <Link href="/products?category=clothing" className="hover:text-brown transition-colors">
              Clothing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Wishlist">
            <Link href="/account?tab=wishlist">
              <Heart className="h-5 w-5 text-brown" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" aria-label="Cart">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-brown" />
              <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {session ? '•' : guestCount}
              </span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" aria-label="Account">
            <Link href={session ? '/account' : '/auth/login'}>
              <User className="h-5 w-5 text-brown" />
            </Link>
          </Button>

          {session?.user?.role === 'admin' ? (
            <Button asChild variant="secondary" className="ml-2 hidden md:inline-flex">
              <Link href="/admin">Admin</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
