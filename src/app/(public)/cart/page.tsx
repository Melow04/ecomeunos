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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brown">Shopping Cart</h1>
        <p className="mt-1 text-sm text-muted">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</p>
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
            lineItems.map((i) => (
              <Card key={i.key} className="overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg bg-beige overflow-hidden">
                    <Image
                      src={i.image}
                      alt={i.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${i.id}`} className="font-semibold text-brown hover:underline line-clamp-2">
                      {i.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{i.max > 0 ? `In stock: ${i.max} available` : 'Out of stock'}</p>
                    <div className="mt-3 text-lg font-bold text-brown">${money(i.price)}</div>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={i.onRemove}
                      className="text-muted hover:text-brown transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => i.onQuantity(Math.max(1, i.quantity - 1))}
                        className="px-2 py-1 border border-brown/20 rounded hover:bg-brown/5"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-brown">{i.quantity}</span>
                      <button
                        onClick={() => i.onQuantity(Math.min(i.max, i.quantity + 1))}
                        className="px-2 py-1 border border-brown/20 rounded hover:bg-brown/5"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right font-semibold text-brown">${money(i.price * i.quantity)}</div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {lineItems.length > 0 && (
            <Button asChild variant="secondary" className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {lineItems.length > 0 && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-bold text-brown text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm border-b border-brown/10 pb-4">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-brown">${money(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-brown">${money(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Tax (8%)</span>
                  <span className="font-semibold text-brown">${money(tax)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-brown">Total</span>
                <span className="text-2xl font-bold text-brown">${money(total)}</span>
              </div>

              <Button asChild className="w-full mt-6">
                <Link href="/checkout?step=1">Proceed to Checkout</Link>
              </Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-brown text-sm mb-3">Security</h3>
              <p className="text-xs text-muted">Secure checkout with encrypted payment processing.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
