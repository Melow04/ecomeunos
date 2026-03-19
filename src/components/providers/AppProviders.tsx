'use client'

import { SessionProvider } from 'next-auth/react'
import { WishlistInit } from './WishlistInit'

export function AppProviders({ children }: { children: React.ReactNode }) {     
  return (
    <SessionProvider>
      <WishlistInit />
      {children}
    </SessionProvider>
  )
}

