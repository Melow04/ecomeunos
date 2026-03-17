'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
    <Card className="sticky top-20">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 pt-0">
        <div>
          <div className="text-xs font-semibold text-brown">Category</div>
          <div className="mt-2 space-y-2 text-sm">
            {categories.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-brown/80">
                <input
                  type="checkbox"
                  checked={selected.includes(c.key)}
                  onChange={() => toggle(c.key)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-brown">Price</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" />
            <Input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" />
          </div>
          <div className="mt-2 text-xs text-muted">USD, inclusive of demo pricing.</div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={apply}>
            Apply
          </Button>
          <Button className="flex-1" variant="secondary" onClick={clear}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

