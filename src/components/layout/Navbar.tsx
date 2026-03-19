'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Heart, ShoppingCart, User, Search, Mountain } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { useGlobalCart } from '@/hooks/useGlobalCart'

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    const q = searchParams?.get('q')
    setSearchQuery(q || '')
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/products')
    }
  }

  return (
    <form className="relative" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search for products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-[42px] w-full rounded-md border border-gray-200 bg-white pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}

export function Navbar() {
  const { data: session } = useSession()
  const guestItems = useCart(s => s.guestItems || [])
  const hydrated = useCart(s => s.hydrated)
  const userCount = useGlobalCart(s => s.userCount)
  const setUserCount = useGlobalCart(s => s.setUserCount)

  React.useEffect(() => {
    useCart.getState().hydrate?.()
  }, [])

  React.useEffect(() => {
    if (session?.user) {
      fetch('/api/cart')
        .then(r => r.json())
        .then(d => {
          if (d?.items) {
            setUserCount(d.items.reduce((acc: number, i: any) => acc + (i.quantity || 0), 0))
          }
        }).catch(err => console.error('Cart fetch failed', err))
    }
  }, [session, setUserCount])

  const cartCount = session?.user ? userCount : (hydrated ? guestItems.reduce((acc: number, i: any) => acc + (i.quantity || 0), 0) : 0)

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-brown">
            <Image src="/logo.svg" alt="EcoGear Logo" width={40} height={40} className="w-auto h-10" />
            EcoGear
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-brown/80 md:flex">
            <Link href="/products" className="hover:text-brown transition-colors">
              All Products
            </Link>
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

        <div className="hidden flex-1 max-w-md mx-8 md:block">
          <React.Suspense fallback={
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                readOnly
                className="h-[42px] w-full rounded-md border border-gray-200 bg-white pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted"
              />
              <button disabled className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>
          }>
            <SearchInput />
          </React.Suspense>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Cart">
            <Link href="/cart" className="relative group">
              <ShoppingCart className="h-[22px] w-[22px] text-brown group-hover:text-primary transition-colors" strokeWidth={2.5} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                {cartCount > 0 ? cartCount : 0}
              </span>
            </Link>
          </Button>

          {session ? (
            <div className="relative group">
              <Button asChild variant="ghost" size="icon" aria-label="Account">
                <Link href="/account" className="group-hover:bg-black/5">
                  <User className="h-[22px] w-[22px] text-brown group-hover:text-primary transition-colors" strokeWidth={2.5} />
                </Link>
              </Button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white rounded-md shadow-lg border border-black/5 overflow-hidden flex flex-col py-1 mt-1">
                  {session.user?.role === 'admin' && (
                    <Link href="/admin" className="px-4 py-2 text-sm font-medium text-brown hover:bg-black/5 hover:text-primary transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/account" className="px-4 py-2 text-sm font-medium text-brown hover:bg-black/5 hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/account?tab=orders" className="px-4 py-2 text-sm font-medium text-brown hover:bg-black/5 hover:text-primary transition-colors">
                    Order History
                  </Link>
                  <Link href="/account?tab=settings" className="px-4 py-2 text-sm font-medium text-brown hover:bg-black/5 hover:text-primary transition-colors">
                    Settings
                  </Link>
                  <div className="h-px bg-black/5 my-1 mx-2" />
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left w-full">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Account">
              <Link href="/auth/login" className="group">
                <User className="h-[22px] w-[22px] text-brown group-hover:text-primary transition-colors" strokeWidth={2.5} />
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" size="icon" aria-label="Wishlist">
            <Link href="/account?tab=wishlist" className="group">
              <Heart className="h-[22px] w-[22px] text-brown group-hover:text-primary transition-colors" strokeWidth={2.5} />
            </Link>
          </Button>

          {session?.user?.role === 'admin' ? (
            <Button asChild variant="secondary" className="ml-2 hidden md:inline-flex bg-primary text-white hover:bg-primary/90 h-[42px] px-6 rounded-md shadow-sm">
              <Link href="/admin">Admin</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
