'use client'

import { create } from 'zustand'

type WishlistState = {
  items: string[]
  hydrated: boolean
  fetchWishlist: () => Promise<void>
  addWishlist: (productId: string) => Promise<void>
  removeWishlist: (productId: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  hydrated: false,
  fetchWishlist: async () => {
    try {
      const res = await fetch('/api/wishlist')
      if (res.ok) {
        const data = await res.json()
        set({ items: data, hydrated: true })
      }
    } catch {
      // Handle error gracefully
    }
  },
  addWishlist: async (productId: string) => {
    const items = [...get().items]
    if (!items.includes(productId)) {
      set({ items: [...items, productId] })
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
    }
  },
  removeWishlist: async (productId: string) => {
    set({ items: get().items.filter(id => id !== productId) })
    await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' })
  },
  toggleWishlist: async (productId: string) => {
    const { items, addWishlist, removeWishlist } = get()
    if (items.includes(productId)) {
      await removeWishlist(productId)
    } else {
      await addWishlist(productId)
    }
  },
}))
