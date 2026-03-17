'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/hooks/useCart'

export type ProductForCard = {
  id: string
  name: string
  description: string
  price: string
  category: 'camping' | 'hiking' | 'clothing' | 'footwear'
  stock: number
  status: 'active' | 'low-stock' | 'out-of-stock'
  images: string[]
}

export function ProductCard({ product }: { product: ProductForCard }) {
  const { data: session } = useSession()
  const { hydrate, hydrated, addGuestItem } = useCart()
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const image = product.images[0] || 'https://picsum.photos/seed/eunos-fallback/900/900'

  async function quickAdd() {
    if (busy) return
    setBusy(true)
    try {
      if (session?.user?.id) {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        })
        if (!res.ok) throw new Error('add_failed')
      } else {
        addGuestItem(product.id, 1)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-square bg-beige">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 250px, 50vw"
          />
        </Link>
        <div className="absolute left-3 top-3">
          <Badge variant={product.status === 'out-of-stock' ? 'red' : 'secondary'}>
            {product.category}
          </Badge>
        </div>
        <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            className="w-full"
            variant="secondary"
            disabled={busy || product.stock <= 0}
            onClick={quickAdd}
          >
            {product.stock <= 0 ? 'Out of stock' : busy ? 'Adding…' : 'Quick Add'}
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/products/${product.id}`} className="min-w-0">
            <div className="line-clamp-1 text-sm font-semibold text-brown">{product.name}</div>
            <div className="mt-1 line-clamp-2 text-xs text-muted">{product.description}</div>
          </Link>
          <div className="shrink-0 text-sm font-semibold text-brown">${product.price}</div>
        </div>
      </CardContent>
    </Card>
  )
}
