'use client'

import { create } from 'zustand'

type GlobalCartStore = {
  userCount: number
  setUserCount: (count: number) => void
}

export const useGlobalCart = create<GlobalCartStore>((set) => ({
  userCount: 0,
  setUserCount: (count) => set({ userCount: count }),
}))
