'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/useCart'
import { Trash2 } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: string
  images: string[]
  stock: number
}

type UserCartItem = {
  id: string
  quantity: number
  product: Product
}

type LineItem = {
  key: string
  id: string
  name: string
  price: number
  quantity: number
  max: number
  image: string
  onQuantity: (q: number) => Promise<void>
  onRemove: () => Promise<void>
}

function isLineItem(v: LineItem | null): v is LineItem {
  return v !== null
}

function money(n: number) {
  return n.toFixed(2)
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const { hydrated, hydrate, guestItems, setGuestQuantity, removeGuestItem } = useCart()

  const [userItems, setUserItems] = React.useState<UserCartItem[]>([])
  const [guestProducts, setGuestProducts] = React.useState<Record<string, Product>>({})
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  React.useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    fetch('/api/cart')
      .then((r) => r.json())
      .then((data) => setUserItems(data.items ?? []))
      .finally(() => setLoading(false))
  }, [status])

  React.useEffect(() => {
    if (session?.user?.id) return
    const missing = guestItems
      .map((i) => i.productId)
      .filter((id) => !guestProducts[id])
    if (missing.length === 0) return

    Promise.all(
      missing.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => data?.product as Product | undefined)
      )
    ).then((rows) => {
      const next = { ...guestProducts }
      rows.filter(Boolean).forEach((p) => {
        next[(p as Product).id] = p as Product
      })
      setGuestProducts(next)
    })
  }, [guestItems, guestProducts, session?.user?.id])

  const lineItems: LineItem[] = session?.user?.id
    ? userItems.map((i) => ({
        key: i.id,
        id: i.product.id,
        name: i.product.name,
        price: Number(i.product.price),
        quantity: i.quantity,
        max: i.product.stock,
        image: i.product.images[0] || 'https://picsum.photos/seed/eunos-fallback/900/900',
        onQuantity: async (q: number) => {
          await fetch(`/api/cart/${i.id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ quantity: q }),
          })
          setUserItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, quantity: q } : x)))
        },
        onRemove: async () => {
          await fetch(`/api/cart/${i.id}`, { method: 'DELETE' })
          setUserItems((prev) => prev.filter((x) => x.id !== i.id))
        },
      }))
    : guestItems
        .map((i) => {
          const p = guestProducts[i.productId]
          if (!p) return null
          return {
            key: i.productId,
            id: i.productId,
            name: p.name,
            price: Number(p.price),
            quantity: i.quantity,
            max: p.stock,
            image: p.images[0] || 'https://picsum.photos/seed/eunos-fallback/900/900',
            onQuantity: async (q: number) => setGuestQuantity(i.productId, q),
            onRemove: async () => removeGuestItem(i.productId),
          } satisfies LineItem
        })
        .filter(isLineItem)

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = lineItems.length > 0 ? 9.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div>
        <h1 className="text-[32px] font-bold text-brown">Shopping Cart</h1>
        <p className="mt-1 text-base font-semibold text-brown/70">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_400px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-6 text-sm text-muted">Loading your cart…</Card>
          ) : lineItems.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-muted mb-4">Your cart is empty.</p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </Card>
          ) : (
            <>
              {lineItems.map((i) => (
                <Card key={i.key} className="overflow-hidden border border-black/10 rounded-md shadow-sm">
                  <div className="flex gap-6 p-6 items-center">
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${i.id}`} className="font-bold text-lg text-black hover:underline line-clamp-2">
                        {i.name}
                      </Link>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">TENTS</p>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => i.onQuantity(Math.max(1, i.quantity - 1))}
                          className="flex h-7 w-7 items-center justify-center rounded bg-gray-200 text-brown font-bold hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold text-lg text-brown">{i.quantity}</span>
                        <button
                          onClick={() => i.onQuantity(Math.min(i.max, i.quantity + 1))}
                          className="flex h-7 w-7 items-center justify-center rounded bg-gray-200 text-brown font-bold hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-6 justify-between self-stretch">
                      {/* Price and trash could be arranged here, mock shows price then trash icon */}
                      <div className="flex items-center gap-6 mt-auto">
                        <div className="text-xl font-black text-black">$ {money(i.price * i.quantity)}</div>
                        <button
                          onClick={i.onRemove}
                          className="text-red-600 hover:text-red-700 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-6 w-6 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="pt-2">
                <button className="text-sm font-black text-red-600 hover:underline">
                  Clear All Items
                </button>
              </div>
            </>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {lineItems.length > 0 && (
          <div className="space-y-4">
            <Card className="p-8 border border-black/10 rounded-md shadow-sm">
              <h2 className="font-black text-black text-xl mb-6">Order Summary</h2>

              <div className="space-y-4 text-base border-b border-black/10 pb-6">
                <div className="flex justify-between items-center">
                  <span className="text-brown/70 font-medium">Subtotal</span>
                  <span className="font-bold text-black">$ {money(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown/70 font-medium">Shipping</span>
                  <span className="font-bold text-black">${money(shipping)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brown/70 font-medium">Tax(8%)</span>
                  <span className="font-bold text-black">${money(tax)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Button asChild className="w-full bg-[#8b9168] hover:bg-[#7a805c] text-white font-bold h-12 shadow-none rounded-md">
                  <Link href="/checkout?step=1">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border border-black/20 text-black font-bold h-12 shadow-none rounded-md">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-black/10 text-center">
                <p className="text-black/70 font-medium text-sm">Secure Checkout</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
