'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useWishlist } from '@/hooks/useWishlist'

export function WishlistInit() {
  const { data: session, status } = useSession()
  const { fetchWishlist, hydrated } = useWishlist()

  useEffect(() => {
    if (status === 'authenticated' && !hydrated) {
      fetchWishlist()
    }
  }, [status, hydrated, fetchWishlist])

  return null
}
