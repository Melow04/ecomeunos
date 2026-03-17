'use client'

import { create } from 'zustand'

export type GuestCartItem = {
  productId: string
  quantity: number
}

const storageKey = 'eunos_guest_cart'

function readStorage(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((i) => ({
        productId: String(i.productId ?? ''),
        quantity: Number(i.quantity ?? 0),
      }))
      .filter((i) => i.productId && Number.isFinite(i.quantity) && i.quantity > 0)
  } catch {
    return []
  }
}

function writeStorage(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(items))
  window.dispatchEvent(new StorageEvent('storage', { key: storageKey }))
}

type CartState = {
  hydrated: boolean
  guestItems: GuestCartItem[]
  hydrate: () => void
  addGuestItem: (productId: string, quantity: number) => void
  setGuestQuantity: (productId: string, quantity: number) => void
  removeGuestItem: (productId: string) => void
  clearGuest: () => void
  guestCount: () => number
}

export const useCart = create<CartState>((set, get) => ({
  hydrated: false,
  guestItems: [],
  hydrate: () => {
    const items = readStorage()
    set({ hydrated: true, guestItems: items })
  },
  addGuestItem: (productId, quantity) => {
    const items = [...get().guestItems]
    const idx = items.findIndex((i) => i.productId === productId)
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity }
    } else {
      items.push({ productId, quantity })
    }
    const cleaned = items.filter((i) => i.quantity > 0)
    set({ guestItems: cleaned })
    writeStorage(cleaned)
  },
  setGuestQuantity: (productId, quantity) => {
    const items = get().guestItems
      .map((i) => (i.productId === productId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0)
    set({ guestItems: items })
    writeStorage(items)
  },
  removeGuestItem: (productId) => {
    const items = get().guestItems.filter((i) => i.productId !== productId)
    set({ guestItems: items })
    writeStorage(items)
  },
  clearGuest: () => {
    set({ guestItems: [] })
    writeStorage([])
  },
  guestCount: () => get().guestItems.reduce((sum, i) => sum + i.quantity, 0),
}))

