'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'

const categories = [
  { key: 'camping', label: 'Camping' },
  { key: 'hiking', label: 'Hiking' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'footwear', label: 'Footwear' },
] as const

export function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialCats = (searchParams.get('category') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const [selected, setSelected] = React.useState<string[]>(initialCats)
  const [minPrice, setMinPrice] = React.useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get('maxPrice') ?? '')

  function toggle(cat: string) {
    setSelected((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  function apply() {
    const next = new URLSearchParams(searchParams)
    if (selected.length > 0) next.set('category', selected.join(','))
    else next.delete('category')

    if (minPrice.trim()) next.set('minPrice', minPrice.trim())
    else next.delete('minPrice')

    if (maxPrice.trim()) next.set('maxPrice', maxPrice.trim())
    else next.delete('maxPrice')

    next.set('page', '1')
    router.push(`${pathname}?${next.toString()}`)
  }

  function clear() {
    setSelected([])
    setMinPrice('')
    setMaxPrice('')
    router.push(pathname)
  }

  return (
    <div className="sticky top-20">
      <div className="space-y-8">
        <div className="border-b border-black/10 pb-8">
          <div className="text-xl font-bold text-black mb-4">Categories</div>
          <div className="space-y-3 font-semibold text-black">
            {categories.map((c) => {
              const isActive = selected.includes(c.key)
              return (
                <label key={c.key} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-primary border-primary text-white' : 'border-black/20 group-hover:border-black/40'}`}>
                    {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggle(c.key)}
                    className="hidden"
                  />
                  <span>{c.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="border-b border-black/10 pb-8">
          <div className="text-xl font-bold text-black mb-4">Price Range</div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 font-bold">$</span>
              <Input 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)} 
                placeholder="Min" 
                className="pl-7 bg-white border-black/20 font-semibold"
              />
            </div>
            <span className="text-black/50 font-bold">-</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 font-bold">$</span>
              <Input 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)} 
                placeholder="Max" 
                className="pl-7 bg-white border-black/20 font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-primary hover:bg-[#859271] text-white font-bold h-12 shadow-none rounded-md" onClick={apply}>
            Apply Filters
          </Button>
          <Button className="flex-1 border-2 border-black/20 text-black hover:bg-black/5 font-bold h-12 shadow-none rounded-md" variant="outline" onClick={clear}>
            Clear All
          </Button>
        </div>
      </div>
    </div>
  )
}

