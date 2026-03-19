'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import * as React from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'

export type ProductForCard = {
  id: string
  name: string
  description: string
  price: string
  category: 'camping' | 'hiking' | 'clothing' | 'footwear'
  stock: number
  status: 'active' | 'low-stock' | 'out-of-stock'
  images: string[]
  isFeatured?: boolean
  isNew?: boolean
  isSale?: boolean
}

export function ProductCard({ product }: { product: ProductForCard }) {
  const { data: session } = useSession()
  const { hydrate, hydrated, addGuestItem } = useCart()
  const { items: wishlistItems, toggleWishlist } = useWishlist()
  const [busy, setBusy] = React.useState(false)

  const isWishlisted = wishlistItems.includes(product.id)

  React.useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const image = product.images[0] || 'https://picsum.photos/seed/eunos-fallback/900/900'
  
  const oldPrice = product.isSale ? (parseFloat(product.price) * 1.2).toFixed(2) : null

  async function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
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
      toast.success(`${product.name} added to cart`)
    } catch (err) {
      toast.error('Failed to add item to cart')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="group overflow-hidden rounded-md border border-black/5 shadow-none transition-shadow hover:shadow-sm">
      <div className="relative aspect-[4/5] bg-gray-200">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 250px, 50vw"
          />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isSale && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm w-fit">
              SALE
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm w-fit">
              NEW
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-full bg-brand-gold px-2.5 py-0.5 text-xs font-bold text-white shadow-sm w-fit">
              FEATURED
            </span>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault()
            if (!session?.user?.id) {
              toast.error('Please log in to use the wishlist')
              return
            }
            toggleWishlist(product.id)
            if (isWishlisted) {
              toast.success(`${product.name} removed from wishlist`)
            } else {
              toast.success(`${product.name} added to wishlist`)
            }
          }}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white transition-colors ${isWishlisted ? 'text-red-500 hover:text-red-700' : 'text-muted hover:text-brown'}`}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            className="w-full bg-primary/90 text-white hover:bg-primary shadow-sm"
            disabled={busy || product.stock <= 0}
            onClick={quickAdd}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock <= 0 ? 'Out of stock' : busy ? 'Adding…' : 'Quick Add'}
          </Button>
        </div>
      </div>
      <CardContent className="p-4 bg-white">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">{product.category}</span>
          <Link href={`/products/${product.id}`} className="min-w-0">
            <div className="line-clamp-1 text-sm font-semibold text-brown">{product.name}</div>
          </Link>
          <div className="flex items-center gap-1 mt-1 text-xs text-brand-gold">
            <span className="text-yellow-400">★</span>
            <span className="font-medium text-brown">4.8</span>
            <span className="text-muted">(342)</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-brown">${product.price}</span>
            {oldPrice && <span className="text-xs text-muted line-through">${oldPrice}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
